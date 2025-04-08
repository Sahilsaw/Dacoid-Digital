import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import useStore from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, ExternalLink, BarChart2 } from 'lucide-react';

const searchSchema = z.object({
  search: z.string().optional()
});

export default function Dashboard() {
  const { toast } = useToast();
  const {
    links,
    totalLinks,
    currentPage,
    searchQuery,
    isLoading,
    error,
    fetchLinks
  } = useStore();

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const {
    register,
    watch
  } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: { search: searchQuery }
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const timeoutId = setTimeout(() => {
        setDebouncedSearch(value.search || '');
      }, 500);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    fetchLinks(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

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

  if (error) {
    toast({
      title: 'Error',
      description: error,
      variant: 'destructive'
    });
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Links</h1>
        <Button asChild>
          <RouterLink to="/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Link
          </RouterLink>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Links</CardTitle>
          <CardDescription>Find your shortened links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search by URL or alias..."
              {...register('search')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original URL</TableHead>
                <TableHead>Short URL</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No links found
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="max-w-xs truncate">
                      {link.originalUrl}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => copyToClipboard(`${window.location.origin}/${link.shortUrl}`)}
                      >
                        {link.shortUrl}
                      </Button>
                    </TableCell>
                    <TableCell>{link._count?.clicks || 0}</TableCell>
                    <TableCell>
                      {format(new Date(link.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {link.expiresAt
                        ? format(new Date(link.expiresAt), 'MMM d, yyyy')
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <RouterLink to={`/analytics/${link.id}`}>
                            <BarChart2 className="h-4 w-4" />
                          </RouterLink>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(link.originalUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalLinks > 10 && (
        <div className="flex justify-center mt-4 space-x-2">
          <Button
            variant="outline"
            onClick={() => fetchLinks(currentPage - 1, debouncedSearch)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchLinks(currentPage + 1, debouncedSearch)}
            disabled={currentPage * 10 >= totalLinks}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 