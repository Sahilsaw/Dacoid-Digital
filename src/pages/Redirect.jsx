import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const Redirect = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const getOriginalUrl = useStore((state) => state.getOriginalUrl);

  useEffect(() => {
    const redirectToOriginalUrl = async () => {
      const originalUrl = await getOriginalUrl(shortCode);
      if (originalUrl) {
        window.location.href = originalUrl;
      } else {
        navigate('/404');
      }
    };

    redirectToOriginalUrl();
  }, [shortCode, getOriginalUrl, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Redirecting...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default Redirect; 