import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * PROJECT.md §3. This is not here for the host. It is here to make the
   * "no backend" non-goal structural instead of aspirational: with a static
   * export an API route or a server action fails the build, so a server
   * cannot be added quietly later. Capability is removed on purpose.
   */
  output: 'export',
};

export default nextConfig;
