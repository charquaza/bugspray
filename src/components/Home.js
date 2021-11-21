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
                    </ul>
                </nav>
            </header>

            <main>
                <h1>Home</h1>
            </main>
        </>
    )
}

export default Home;