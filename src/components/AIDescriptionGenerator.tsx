"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Plus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIDescriptionGeneratorProps {
  onDescriptionGenerated: (description: string) => void;
  eventTitle?: string;
  eventType?: string;
  location?: string;
}

export function AIDescriptionGenerator({ 
  onDescriptionGenerated, 
  eventTitle = '',
  eventType = '',
  location = ''
}: AIDescriptionGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    eventTitle: eventTitle,
    eventType: eventType,
    targetAudience: '',
    duration: '',
    location: location,
    keyPoints: ['']
  });
  const { toast } = useToast();

  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      keyPoints: [...prev.keyPoints, '']
    }));
  };

  const removeKeyPoint = (index: number) => {
    if (formData.keyPoints.length > 1) {
      setFormData(prev => ({
        ...prev,
        keyPoints: prev.keyPoints.filter((_, i) => i !== index)
      }));
    }
  };

  const updateKeyPoint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.map((point, i) => i === index ? value : point)
    }));
  };

  const handleGenerate = async () => {
    // Validate required fields
    const validKeyPoints = formData.keyPoints.filter(point => point.trim().length > 0);
    
    if (!formData.eventTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Event title is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.eventType.trim()) {
      toast({
        title: "Validation Error", 
        description: "Event type is required",
        variant: "destructive"
      });
      return;
    }

    if (validKeyPoints.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one key point is required",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventTitle: formData.eventTitle,
          eventType: formData.eventType,
          targetAudience: formData.targetAudience,
          duration: formData.duration,
          location: formData.location,
          keyPoints: validKeyPoints
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }

      const result = await response.json();
      onDescriptionGenerated(result.description);
      setIsOpen(false);
      
      toast({
        title: "Description Generated!",
        description: "AI has successfully created your event description.",
      });
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Generate Description with AI
      </Button>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Description Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ai-title">Event Title *</Label>
            <Input
              id="ai-title"
              value={formData.eventTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, eventTitle: e.target.value }))}
              placeholder="Enter event title"
            />
          </div>
          <div>
            <Label htmlFor="ai-type">Event Type *</Label>
            <Select 
              value={formData.eventType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Seminar">Seminar</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ai-audience">Target Audience</Label>
            <Input
              id="ai-audience"
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="e.g., Computer Science students"
            />
          </div>
          <div>
            <Label htmlFor="ai-duration">Duration</Label>
            <Input
              id="ai-duration"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 2 hours"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="ai-location">Location</Label>
          <Input
            id="ai-location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Event location"
          />
        </div>

        <div>
          <Label>Key Points to Include *</Label>
          <div className="space-y-2 mt-2">
            {formData.keyPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={point}
                  onChange={(e) => updateKeyPoint(index, e.target.value)}
                  placeholder={`Key point ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeKeyPoint(index)}
                  disabled={formData.keyPoints.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addKeyPoint}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Key Point
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Description
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
