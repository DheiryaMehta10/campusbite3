// FILE: apps/student-app/app/page.tsx (Redirect to auth)
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/auth/login');
}