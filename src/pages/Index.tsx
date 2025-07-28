import Dashboard from '@/features/dashboard/components/Dashboard';
import { TimeCalculatorProvider } from '@/features/time-calculator/contexts/TimeCalculatorContext';

const Index = () => {
  return (
    <TimeCalculatorProvider>
      <Dashboard />
    </TimeCalculatorProvider>
  );
};

export default Index;
