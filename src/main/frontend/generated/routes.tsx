







import { createBrowserRouter, RouteObject } from 'react-router';
import { serverSideRoutes } from 'Frontend/generated/flow/Flow';

function build() {
    const routes = [...serverSideRoutes] as RouteObject[];
    return {
        router: createBrowserRouter([...routes], { basename: new URL(document.baseURI).pathname }),
        routes
    };
}
export const { router, routes } = build()
