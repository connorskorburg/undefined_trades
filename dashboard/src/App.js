import Dashboard from "./pages/Dashboard";
import TickerState from './context/ticker/TickerState';

const App = () => {
  return (
    <TickerState>
      <Dashboard />
    </TickerState>
  );
}

export default App;
