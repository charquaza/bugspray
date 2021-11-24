import { Link } from 'react-router-dom';

function Home() {
    return (
        <>
            <header>
                <nav>
                    <ul>
                        <li>
                            <Link to='sign-up'>Sign Up</Link>
                        </li>
                        <li>
                            <Link to='log-in'>Log In</Link>
                        </li>
                        {/* remove dashboard link after development */}
                        <li>
                            <Link to='dashboard'>Dashboard (only for development)</Link>
                        </li>
                    </ul>
                </nav>
            </header>

            <main>
                <h1>MoveForward</h1>
            </main>
        </>
    )
}

export default Home;