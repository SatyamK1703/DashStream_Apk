import fs from 'fs';
import path from 'path';

describe('README.md', () => {
  it('should exist', () => {
    const readmePath = path.join(__dirname, '..', 'README.md');
    expect(fs.existsSync(readmePath)).toBe(true);
  });

  it('should have the correct content', () => {
    const readmePath = path.join(__dirname, '..', 'README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    expect(readmeContent).toContain('# DashStream Apk');
  });
});
