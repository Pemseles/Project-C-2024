import logo from './logo.svg';
import './App.css';
import Example1Page from './pages/example1/example1';
import Example2Page from './pages/example2/example2';

const pages = [Example1Page, Example2Page];

function App() {
    const pathName = window.location.pathname;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        if (pathName == page.url) {
            let queryParamsString = window.location.search;
            let queryParamsObject = {};

            if (queryParamsString !== '') {
                const params = queryParamsString
                    .slice(1, queryParamsString.length)
                    .split('&');

                for (let i = 0; i < params.length; i++) {
                    const param = params[i];

                    const sepIndex = param.indexOf('=');

                    const key = param.slice(0, sepIndex);
                    const val = param.slice(sepIndex + 1, param.length);

                    queryParamsObject[key] = val;
                }
            }

            return page.render(queryParamsObject);
        }
    }

    return <h1>ERROR 404</h1>;
}

export default App;
