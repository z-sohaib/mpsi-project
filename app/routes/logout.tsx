import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { logout } from '~/session.server';

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

export function loader() {
  return redirect('/auth');
}
