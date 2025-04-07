import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import useStore from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Copy, QrCode } from 'lucide-react';

const createLinkSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL'),
  customAlias: z.string().optional(),
  expiresAt: z.string().optional().refine((date) => {
    if (!date) return true;
    const selectedDate = new Date(date);
    const now = new Date();
    return selectedDate > now;
  }, 'Expiration date must be in the future')
});

export default function CreateLink() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createLink = useStore((state) => state.createLink);
  const [isLoading, setIsLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createLinkSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Ensure the URL has a protocol
      if (!data.originalUrl.startsWith('http://') && !data.originalUrl.startsWith('https://')) {
        data.originalUrl = `https://${data.originalUrl}`;
      }

      // Format the expiration date if provided
      if (data.expiresAt) {
        data.expiresAt = new Date(data.expiresAt).toISOString();
      }

      const link = await createLink(data);
      if (link) {
        setCreatedLink(link);
        toast({
          title: 'Success',
          description: 'Link created successfully'
        });
      }
    } catch (error) {
      console.error('Error creating link:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create link',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Success',
        description: 'Link copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-8"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Link</CardTitle>
            <CardDescription>Shorten your URL and track its performance</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter URL to shorten"
                  {...register('originalUrl')}
                  disabled={isLoading}
                />
                {errors.originalUrl && (
                  <p className="text-sm text-red-500">{errors.originalUrl.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Custom alias (optional)"
                  {...register('customAlias')}
                  disabled={isLoading}
                />
                {errors.customAlias && (
                  <p className="text-sm text-red-500">{errors.customAlias.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="datetime-local"
                  {...register('expiresAt')}
                  disabled={isLoading}
                />
                {errors.expiresAt && (
                  <p className="text-sm text-red-500">{errors.expiresAt.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Link'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {createdLink && (
          <Card>
            <CardHeader>
              <CardTitle>Your Shortened Link</CardTitle>
              <CardDescription>Share this link with others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Short URL</p>
                <div className="flex items-center space-x-2">
                  <Input
                    value={`${window.location.origin}/${createdLink.shortUrl}`}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(`${window.location.origin}/${createdLink.shortUrl}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">QR Code</p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    value={`${window.location.origin}/${createdLink.shortUrl}`}
                    size={200}
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate('/')}
              >
                View All Links
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 