import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import useStore from '@/store/useStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analytics, isLoadingAnalytics, error, fetchAnalytics } = useStore();

  useEffect(() => {
    fetchAnalytics(linkId);
  }, [linkId]);

  if (error) {
    toast({
      title: 'Error',
      description: error,
      variant: 'destructive'
    });
  }

  const clicksOverTimeData = analytics?.clicksOverTime
    ? Object.entries(analytics.clicksOverTime).map(([date, count]) => ({
        date,
        count
      }))
    : [];

  const deviceData = analytics?.deviceBreakdown
    ? Object.entries(analytics.deviceBreakdown).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  const browserData = analytics?.browserBreakdown
    ? Object.entries(analytics.browserBreakdown).map(([name, value]) => ({
        name,
        value
      }))
    : [];

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

      {isLoadingAnalytics ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Total Clicks</CardTitle>
              <CardDescription>Overall performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{analytics.totalClicks}</div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Clicks Over Time</CardTitle>
              <CardDescription>Daily click activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clicksOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Types of devices used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {deviceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browser Breakdown</CardTitle>
              <CardDescription>Types of browsers used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={browserData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {browserData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8">No analytics data available</div>
      )}
    </div>
  );
} 