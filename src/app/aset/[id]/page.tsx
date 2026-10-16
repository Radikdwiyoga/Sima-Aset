import DetailClient from './DetailClient';

export function generateStaticParams() {
  return [
    { id: 'ast-1' },
    { id: 'ast-2' },
    { id: 'ast-3' },
    { id: 'ast-4' },
    { id: 'ast-5' },
    { id: 'ast-6' },
  ];
}

export default function DetailAsetPage() {
  return <DetailClient />;
}
