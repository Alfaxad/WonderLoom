import Link from "next/link";
import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="logo" href="/" aria-label="WonderLoom home">
      <span className="logo-mark" aria-hidden="true"><Image src="/images/brand/wonderloom-fox-mark-v1.png" alt="" width={44} height={44} priority /></span>
      {!compact && <span>WonderLoom</span>}
    </Link>
  );
}
