import React from 'react';

export const BrowserRouter = ({ children }) => React.createElement('div', {}, children);
export const Routes = ({ children }) => React.createElement('div', {}, children);
export const Route = ({ element }) => React.createElement('div', {}, element);
export const useLocation = () => ({ pathname: '/tasks' });
export const useNavigate = () => jest.fn();