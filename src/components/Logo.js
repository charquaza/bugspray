import logo from '../mozilla-bug-emoji.png';

function Logo() {
    return (
        <div className='logo-container'>
            <img src={logo} alt='The app logo' className='logo' />
        </div>
    );
}

export default Logo;