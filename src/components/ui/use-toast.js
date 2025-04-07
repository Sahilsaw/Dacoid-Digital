import { toast } from 'sonner';

export function useToast() {
  return {
    toast: ({ title, description, action, variant, ...props }) => {
      // Create a properly formatted message for Sonner
      const message = description ? `${title}\n${description}` : title;
      
      // Set up the toast options
      const options = {
        duration: 3000,
        className: variant === 'destructive' ? 'destructive' : '',
        ...props,
      };
      
      // Add action if provided
      if (action) {
        options.action = {
          label: action.label || 'Action',
          onClick: action.onClick || (() => {}),
        };
      }
      
      // Call toast with the correct format
      toast(message, options);
    },
  };
} 