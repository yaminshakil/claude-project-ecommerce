import { redirect } from 'next/navigation';

export default function OldRegisterRedirect() {
  redirect('/register');
}
