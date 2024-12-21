import { render, screen } from '@testing-library/react';
import App from './App';

test('renders join form', () => {
  render(<App />);
  const joinElement = screen.getByText(/Join or Host a Room/i);
  expect(joinElement).toBeInTheDocument();
});
