import Dashboard from '@/components/Dashboard';
import { TimeCalculatorProvider } from '@/contexts/TimeCalculatorContext';

const Index = () => {
  return (
    <TimeCalculatorProvider>
      <Dashboard />
    </TimeCalculatorProvider>
  );
};

export default Index;
