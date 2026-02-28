import { createPortal } from 'react-dom';

/**
 * Portal component to render children outside the current DOM hierarchy.
 * Useful for modals to avoid being trapped by parent CSS transforms.
 */
export const Portal = ({ children }) => {
    return createPortal(children, document.body);
};
