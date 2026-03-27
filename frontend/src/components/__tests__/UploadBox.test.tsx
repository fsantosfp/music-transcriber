import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploadBox } from '../UploadBox';

describe('UploadBox UI', () => {
    it('should render the base dropzone text properly', () => {
        render(<UploadBox onSuccess={() => { }} />);
        expect(screen.getByText(/Arraste um arquivo de áudio ou clique aqui/i)).toBeInTheDocument();
    });
});
