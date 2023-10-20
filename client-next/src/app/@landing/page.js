import Link from 'next/link';

export default function LandingPage() {
    return (
        <main>
            <div>
                <nav>
                    <ul>
                        <li><Link href='/sign-up'>Sign Up</Link></li>
                        <li><Link href='/log-in'>Log In</Link></li>
                    </ul>
                </nav>
            </div>

            <h1>Landing Page</h1>
            <p>Welcome to Bug Tracker! You are not logged in. This is the landing page.</p>
        </main>
    );
}