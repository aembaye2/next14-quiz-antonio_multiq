In React, there are several ways to pass state from one page (or component) to another. Here are the most common approaches:

1. Using React Router (URL Parameters or Query Strings)
   React Router is commonly used to navigate between different pages (or views) in a React application. You can pass state between pages using URL parameters or query strings.

a. Passing State through URL Parameters:
URL parameters can be accessed in the target component via useParams() hook.

Example:

Page 1 (Sending State):
jsx
Copy code
import { Link } from 'react-router-dom';

function Page1() {
const stateData = 'Hello from Page1';

return (
<div>
<Link to={`/page2/${stateData}`}>Go to Page 2</Link>
</div>
);
}

export default Page1;
Page 2 (Receiving State):
jsx
Copy code
import { useParams } from 'react-router-dom';

function Page2() {
const { stateData } = useParams();

return (
<div>
<h1>Received state: {stateData}</h1>
</div>
);
}

export default Page2;
Here, stateData is passed in the URL as a path parameter and can be accessed using useParams().

b. Passing State via Query Strings:
You can also use query parameters to pass state data.

Example:

Page 1 (Sending State):
jsx
Copy code
import { Link } from 'react-router-dom';

function Page1() {
const stateData = 'Hello from Page1';

return (
<div>
<Link to={`/page2?data=${stateData}`}>Go to Page 2</Link>
</div>
);
}

export default Page1;
Page 2 (Receiving State):
jsx
Copy code
import { useLocation } from 'react-router-dom';

function Page2() {
const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const stateData = queryParams.get('data');

return (
<div>
<h1>Received state: {stateData}</h1>
</div>
);
}

export default Page2;
Here, the state is passed as a query string and accessed using useLocation() and URLSearchParams.

2. Using Context API (Global State Management)
   If the state needs to be shared across multiple pages or components, you can use React's Context API. This is useful when you need to manage global state or pass data through many components without prop drilling.

Example:

Create a Context:
jsx
Copy code
import React, { createContext, useState, useContext } from 'react';

// Create a context
const MyStateContext = createContext();

export const useMyState = () => {
return useContext(MyStateContext);
};

export const MyStateProvider = ({ children }) => {
const [stateData, setStateData] = useState('Hello from context!');

return (
<MyStateContext.Provider value={{ stateData, setStateData }}>
{children}
</MyStateContext.Provider>
);
};
Wrap your App in the Provider:
jsx
Copy code
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { MyStateProvider } from './MyStateContext';
import Page1 from './Page1';
import Page2 from './Page2';

function App() {
return (
<MyStateProvider>
<Router>
<Switch>
<Route path="/page1" component={Page1} />
<Route path="/page2" component={Page2} />
</Switch>
</Router>
</MyStateProvider>
);
}

export default App;
Access and Modify State in the Pages:
Page 1 (Setting State):
jsx
Copy code
import React from 'react';
import { useMyState } from './MyStateContext';
import { Link } from 'react-router-dom';

function Page1() {
const { setStateData } = useMyState();

const updateState = () => {
setStateData('Updated state from Page 1');
};

return (
<div>
<button onClick={updateState}>Update State</button>
<Link to="/page2">Go to Page 2</Link>
</div>
);
}

export default Page1;
Page 2 (Getting State):
jsx
Copy code
import React from 'react';
import { useMyState } from './MyStateContext';

function Page2() {
const { stateData } = useMyState();

return (
<div>
<h1>Received state: {stateData}</h1>
</div>
);
}

export default Page2;
This way, you can share state across different pages without passing props manually.

3. Using Local Storage or Session Storage
   For more persistent state that persists even when the page is reloaded, you can use localStorage or sessionStorage. This is a good approach when you need to store state across different sessions or tabs.

Example:

Page 1 (Setting State in localStorage):
jsx
Copy code
import { Link } from 'react-router-dom';

function Page1() {
const stateData = 'Hello from Page1';
localStorage.setItem('stateData', stateData);

return (
<div>
<Link to="/page2">Go to Page 2</Link>
</div>
);
}

export default Page1;
Page 2 (Getting State from localStorage):
jsx
Copy code
import React, { useEffect, useState } from 'react';

function Page2() {
const [stateData, setStateData] = useState('');

useEffect(() => {
const storedData = localStorage.getItem('stateData');
if (storedData) {
setStateData(storedData);
}
}, []);

return (
<div>
<h1>Received state: {stateData}</h1>
</div>
);
}

export default Page2;
Here, stateData is stored in localStorage and accessed when navigating to Page2.

4. Passing Props Directly (For Parent-Child Component Communication)
   If the components are directly related (i.e., one is a parent of the other), you can pass state via props.

Example:

Parent Component:
jsx
Copy code
import Page2 from './Page2';

function ParentComponent() {
const stateData = 'Hello from Parent';

return (
<div>
<Page2 stateData={stateData} />
</div>
);
}

export default ParentComponent;
Child Component (Page2):
jsx
Copy code
function Page2({ stateData }) {
return <h1>Received state: {stateData}</h1>;
}

export default Page2;
This is ideal for situations where the components are in a direct relationship, and you don't need to share the state globally.

Summary
React Router (URL Params/Query Strings): Pass state via URL, suitable for page navigation.
Context API: Pass state across components without prop drilling.
Local Storage/Session Storage: For persistent state across page reloads or sessions.
Props: Directly pass state from parent to child component.
The best approach depends on your specific use case—whether you need to pass state between related components, across the app, or persist state across sessions.
