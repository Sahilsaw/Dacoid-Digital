import { toast } from 'sonner';

export function useToast() {
  return {
    toast: ({ title, description, action, variant, ...props }) => {
      const message = description ? `${title}\n${description}` : title;
      
      const options = {
        duration: 3000,
        className: variant === 'destructive' ? 'destructive' : '',
        ...props,
      };
      
      if (action) {
        options.action = {
          label: action.label || 'Action',
          onClick: action.onClick || (() => {}),
        };
      }
      
      toast(message, options);
    },
  };
} 