import { Link } from 'react-router-dom';
import logo from '../mozilla-bug-emoji.png';

function Logo() {
    return (
        <div className='logo-container'>
            <Link to='/'>
                <img src={logo} alt='The app logo' className='logo' />
            </Link>
        </div>
    );
}

export default Logo;