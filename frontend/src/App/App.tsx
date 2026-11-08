import {RouterProvider} from "react-router-dom";
import {router} from "./providers/router.tsx";
import {WithAuth} from "./providers/with-auth.tsx";

function App() {
    return(
        <WithAuth>
            <RouterProvider router={router}/>
        </WithAuth>
    )
}

export default App
