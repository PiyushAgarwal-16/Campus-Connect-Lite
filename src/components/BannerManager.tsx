'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image, Trash2, Download, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Event } from '@/lib/types';

interface BannerManagerProps {
  event: Event;
  onBannerUpdate: (banner: { url: string; generatedAt: string; prompt: string } | null) => void;
  disabled?: boolean;
}

interface BannerData {
  url: string;
  generatedAt: string;
  prompt: string;
}

export default function BannerManager({ event, onBannerUpdate, disabled = false }: BannerManagerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorScheme, setColorScheme] = useState<string>('professional');

  // Debug logging
  useEffect(() => {
    console.log('BannerManager received event data:', {
      title: event.title,
      category: event.category,
      description: event.description,
      location: event.location,
      date: event.date
    });
  }, [event]);

  const generateBanner = async () => {
    // Validate required fields
    if (!event.title?.trim()) {
      setError('Please add an event title before generating a banner');
      return;
    }
    
    if (!event.category?.trim()) {
      setError('Please select an event category before generating a banner');
      return;
    }
    
    if (!event.description?.trim()) {
      setError('Please add an event description before generating a banner');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const requestData = {
      eventTitle: event.title.trim(),
      eventType: event.category.trim(),
      description: event.description.trim(),
      location: event.location?.trim() || '',
      date: event.date || '',
      colorScheme: colorScheme
    };

    console.log('Banner generation request data:', requestData);

    try {
      const response = await fetch('/api/generate-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate banner');
      }

      if (data.success && data.banner) {
        const bannerData: BannerData = {
          url: data.banner.imageUrl,
          generatedAt: data.banner.generatedAt,
          prompt: data.banner.prompt
        };
        console.log('Banner generated successfully, updating with:', bannerData);
        onBannerUpdate(bannerData);
      } else {
        throw new Error('Invalid response from banner generation service');
      }
    } catch (err) {
      console.error('Banner generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate banner');
    } finally {
      setIsGenerating(false);
    }
  };

  const removeBanner = () => {
    onBannerUpdate(null);
  };

  const downloadBanner = () => {
    if (event.banner?.url) {
      const link = document.createElement('a');
      link.href = event.banner.url;
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_banner.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Event Banner
        </CardTitle>
        <CardDescription>
          Generate an AI-powered banner for your event based on the description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {event.banner ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={event.banner.url}
                alt={`Banner for ${event.title}`}
                className="w-full rounded-lg border shadow-sm"
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              />
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 bg-black/70 text-white"
              >
                AI Generated
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={downloadBanner}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              
              <Button
                onClick={generateBanner}
                variant="outline"
                size="sm"
                disabled={isGenerating || disabled}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate
              </Button>
              
              <Button
                onClick={removeBanner}
                variant="outline"
                size="sm"
                disabled={disabled}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Generated on {new Date(event.banner.generatedAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Color Scheme</label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateBanner}
              disabled={isGenerating || disabled || !event.title?.trim() || !event.category?.trim() || !event.description?.trim()}
              className="w-full flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Banner...
                </>
              ) : (
                <>
                  <Image className="h-4 w-4" />
                  Generate Banner
                </>
              )}
            </Button>

            {(!event.title?.trim() || !event.category?.trim() || !event.description?.trim()) && (
              <p className="text-xs text-muted-foreground text-center">
                Please fill in event title, category, and description to enable banner generation
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
