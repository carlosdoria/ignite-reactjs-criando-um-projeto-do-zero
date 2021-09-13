import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Header() {
  const route = useRouter();
  return (
    <header>
      <Image
        src="/logo.svg"
        alt="logo"
        width="100%"
        height="105px"
        onClick={() => route.push('/')}
      />
    </header>
  );
}
