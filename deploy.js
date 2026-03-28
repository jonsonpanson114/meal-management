const { spawnSync } = require('child_process');

const keys = [
  { name: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY', value: 'BFAqWE2Q_lhxYvPqw1SULEQUx8Go5zLZniTAo2W9oafEFZW9idYB-deF__PGl_kUXD9B-DLW1Ad8k-ioimaC9hA' },
  { name: 'VAPID_PRIVATE_KEY', value: 'qPSizVwzkHyKjscFoQorfrKp8w8cmEDCVOFmuN6i_Fo' },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://nmixxmxaduzjtgqlrrif.supabase.co' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taXh4bXhhZHV6anRncWxycmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjg0NzksImV4cCI6MjA4Nzk0NDQ3OX0.tNVuv-QqdtzF97H8vwACimb7wjEleDe73aQ6FzMgMKk' }
];

keys.forEach(key => {
  console.log(`Updating ${key.name}...`);
  // Remove existing
  spawnSync('vercel', ['env', 'rm', key.name, 'production', '--yes'], { shell: true });
  
  // Add new
  const result = spawnSync('vercel', ['env', 'add', key.name, 'production'], {
    input: key.value,
    encoding: 'utf-8',
    shell: true
  });
  console.log(result.stdout);
  if (result.error) console.error(result.error);
});

console.log('Environment variables set. Starting deployment...');
spawnSync('vercel', ['--prod', '--force', '--yes'], { stdio: 'inherit', shell: true });
