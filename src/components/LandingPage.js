import { Link } from 'react-router-dom';

function LandingPage(props) {
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
                <h1>MoveForward</h1>
                <p>Welcome to the Landing Page!</p>

                {/* development only */}
                <button onClick={() => props.setCurrUser({})}>
                    log in to dashboard (development only)
                </button>
            </main>
        </>
    );
}

export default LandingPage;