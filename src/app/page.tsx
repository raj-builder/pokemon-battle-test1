import { redirect } from 'next/navigation';

/**
 * Root page — redirects to the game flow.
 * The main game experience lives at /play.
 */
export default function Home() {
  redirect('/play');
}
