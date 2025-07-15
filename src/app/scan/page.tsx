
"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import jsQR from 'jsqr';
import { useRegistrations } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/contexts/EventContext';
import { format } from 'date-fns';

interface ScannedData {
    userId: string;
    eventId: string;
    userName: string;
    eventName: string;
    registrationId: string;
}

export default function ScanTicketPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [scannedData, setScannedData] = useState<ScannedData | null>(null);
    const [scanResult, setScanResult] = useState<'valid' | 'invalid' | 'already_scanned' | 'event_not_active' | null>(null);
    const [scanResultMessage, setScanResultMessage] = useState<string>('');
    const [isScannerActive, setIsScannerActive] = useState(false);
    
    const { allRegistrations, markAttendance, loading: regLoading } = useRegistrations();
    const { getEventById } = useEvents();

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'organizer')) {
            toast({ variant: 'destructive', title: 'Unauthorized', description: 'You must be an organizer to scan tickets.' });
            router.push('/login');
        }
    }, [user, authLoading, router, toast]);

    // Effect to manage camera lifecycle based on page path
    useEffect(() => {
        const startCamera = async () => {
          try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = mediaStream;
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              await videoRef.current.play();
              setIsScannerActive(true);
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions to scan tickets.',
            });
          }
        };

        const stopCamera = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setIsScannerActive(false);
        };
        
        if (pathname === '/scan' && user?.role === 'organizer') {
            startCamera();
        }

        // Cleanup function runs when component unmounts or path changes
        return () => {
            stopCamera();
        };
    }, [pathname, user, toast]);

    // Effect for the QR scanning loop, runs only when scanner is active
    useEffect(() => {
        if (!isScannerActive) {
            return;
        }
        
        let animationFrameId: number;

        const scan = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (context) {
                    canvas.height = videoRef.current.videoHeight;
                    canvas.width = videoRef.current.videoWidth;
                    
                    if(canvas.width === 0 || canvas.height === 0) {
                        if(isScannerActive) animationFrameId = requestAnimationFrame(scan);
                        return;
                    }

                    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert',
                    });

                    if (code) {
                        setIsScannerActive(false); // Stop scanning once code is found
                        try {
                            const data: ScannedData = JSON.parse(code.data);
                            setScannedData(data);
                           
                            const event = getEventById(data.eventId);
                            if (!event) {
                                setScanResult('invalid');
                                setScanResultMessage('This QR code does not correspond to a known event.');
                                return;
                            }

                            const now = new Date();
                            const eventStart = new Date(`${event.date}T${event.time}`);
                            const eventEnd = event.endTime ? new Date(`${event.date}T${event.endTime}`) : null;

                            if (now < eventStart) {
                                setScanResult('event_not_active');
                                setScanResultMessage(`Check-in is not yet open. The event starts at ${format(eventStart, 'p')}.`);
                                return;
                            }
                            
                            if (eventEnd && now > eventEnd) {
                                setScanResult('event_not_active');
                                setScanResultMessage(`Check-in is closed. The event ended at ${format(eventEnd, 'p')}.`);
                                return;
                            }

                            const registration = allRegistrations.find(reg => reg.id === data.registrationId);
                            if (registration) {
                                if (registration.checkedIn) {
                                    setScanResult('already_scanned');
                                } else {
                                    markAttendance(registration.id);
                                    setScanResult('valid');
                                }
                            } else {
                                setScanResult('invalid');
                                setScanResultMessage('A valid registration was not found for this ticket.');
                            }
                        } catch (e) {
                            console.error("Invalid QR code data:", e);
                            setScannedData({ eventName: "Unknown", eventId: "", registrationId: "", userName: "Unknown", userId: "" });
                            setScanResult('invalid');
                            setScanResultMessage('The QR code is malformed or could not be read.');
                        }
                    } else if (isScannerActive) {
                        animationFrameId = requestAnimationFrame(scan);
                    }
                }
            } else if (isScannerActive) {
                 animationFrameId = requestAnimationFrame(scan);
            }
        };
        
        animationFrameId = requestAnimationFrame(scan);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isScannerActive, allRegistrations, markAttendance, getEventById]);


    const resetScanner = () => {
        setScannedData(null);
        setScanResult(null);
        setScanResultMessage('');
        if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().then(() => setIsScannerActive(true));
        } else {
            setIsScannerActive(true);
        }
    }

    if (authLoading || regLoading || !user) {
        return <div className="max-w-xl mx-auto"><Skeleton className="h-96 w-full" /></div>;
    }

    return (
        <div className="max-w-xl mx-auto">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                        <Camera />
                        Ticket Scanner
                    </CardTitle>
                    <CardDescription>Point the camera at a student&apos;s QR code to validate their ticket.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={scannedData ? 'hidden' : 'block'}>
                        <div className="relative overflow-hidden rounded-md">
                            <video 
                                ref={videoRef} 
                                className="w-full aspect-video bg-muted" 
                                playsInline 
                                autoPlay 
                                muted 
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 border-4 border-white/50 rounded-lg border-dashed" />
                            </div>

                            {hasCameraPermission === null && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                    <p className="text-muted-foreground">Requesting camera access...</p>
                                </div>
                            )}
                        </div>

                        {hasCameraPermission === false && (
                             <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>Please allow camera access in your browser settings to use the scanner.</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    
                    {scannedData && scanResult && (
                        <div className="text-center space-y-4">
                            {scanResult === 'valid' && (
                                <Alert className="bg-green-100 border-green-400 text-green-800">
                                    <CheckCircle className="h-5 w-5 text-green-600"/>
                                    <AlertTitle className="font-bold">Ticket Valid!</AlertTitle>
                                    <AlertDescription className="space-y-2 text-base text-green-900">
                                        <p><span className="font-semibold">Student:</span> {scannedData.userName}</p>
                                        <p><span className="font-semibold">Event:</span> {scannedData.eventName}</p>
                                    </AlertDescription>
                                </Alert>
                            )}
                            {scanResult === 'already_scanned' && (
                                <Alert className="bg-yellow-100 border-yellow-400 text-yellow-800">
                                    <ShieldAlert className="h-5 w-5 text-yellow-600"/>
                                    <AlertTitle className="font-bold">Ticket Already Used</AlertTitle>
                                    <AlertDescription className="space-y-2 text-base text-yellow-900">
                                         <p><span className="font-semibold">Student:</span> {scannedData.userName}</p>
                                         <p><span className="font-semibold">Event:</span> {scannedData.eventName}</p>
                                        <p className="pt-2">This ticket has already been checked in.</p>
                                    </AlertDescription>
                                </Alert>
                            )}
                            {scanResult === 'event_not_active' && (
                                <Alert className="bg-orange-100 border-orange-400 text-orange-800">
                                    <ShieldAlert className="h-5 w-5 text-orange-600"/>
                                    <AlertTitle className="font-bold">Check-in Not Active</AlertTitle>
                                    <AlertDescription className="space-y-2 text-base text-orange-900">
                                        <p><span className="font-semibold">Student:</span> {scannedData.userName}</p>
                                        <p><span className="font-semibold">Event:</span> {scannedData.eventName}</p>
                                        <p className="pt-2">{scanResultMessage}</p>
                                    </AlertDescription>
                                </Alert>
                            )}
                            {scanResult === 'invalid' && (
                                <Alert variant="destructive">
                                    <XCircle className="h-5 w-5"/>
                                    <AlertTitle className="font-bold">Invalid Ticket</AlertTitle>
                                    <AlertDescription>
                                        {scanResultMessage || 'This QR code is not valid or could not be read. Please try again.'}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Button onClick={resetScanner}>Scan Another Ticket</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
