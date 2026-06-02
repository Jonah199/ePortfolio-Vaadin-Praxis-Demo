















import { Flow as _Flow } from 'Frontend/generated/jar-resources/Flow.js';
import React, { useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { matchRoutes, useBlocker, useLocation, useNavigate, type NavigateOptions, useHref } from 'react-router';
import { createPortal } from 'react-dom';

const flow = new _Flow({
    imports: () => import('Frontend/generated/flow/generated-flow-imports.js')
});

const router = {
    render() {
        return Promise.resolve();
    }
};

const flowReact : { active: boolean } = {
    active: false,
}



function getAnchorOrigin(anchor) {
    
    
    const port = anchor.port;
    const protocol = anchor.protocol;
    const defaultHttp = protocol === 'http:' && port === '80';
    const defaultHttps = protocol === 'https:' && port === '443';
    const host =
        defaultHttp || defaultHttps
            ? anchor.hostname 
            : anchor.host; 
    return `${protocol}//${host}`;
}

function normalizeURL(url: URL): void | string {
    
    if (!url.href.startsWith(document.baseURI)) {
        return;
    }

    
    return '/' + url.href.slice(document.baseURI.length);
}

function extractURL(event: MouseEvent): void | URL {
    
    if (event.defaultPrevented) {
        return;
    }

    
    if (event.button !== 0) {
        return;
    }

    
    if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    
    let maybeAnchor = event.target;
    const path = event.composedPath
        ? event.composedPath()
        : 
        event.path || [];

    
    for (let i = 0; i < path.length; i++) {
        const target = path[i];
        if (target.nodeName && target.nodeName.toLowerCase() === 'a') {
            maybeAnchor = target;
            break;
        }
    }

    
    while (maybeAnchor && maybeAnchor.nodeName.toLowerCase() !== 'a') {
        
        maybeAnchor = maybeAnchor.parentNode;
    }

    
    
    if (!maybeAnchor || maybeAnchor.nodeName.toLowerCase() !== 'a') {
        return;
    }

    const anchor = maybeAnchor as HTMLAnchorElement;

    
    if (anchor.target && anchor.target.toLowerCase() !== '_self') {
        return;
    }

    
    if (anchor.hasAttribute('download')) {
        return;
    }

    
    if (anchor.hasAttribute('router-ignore')) {
        return;
    }

    
    if (anchor.pathname === window.location.pathname && anchor.hash !== '') {
        
        window.location.hash = anchor.hash;
        return;
    }

    
    
    
    const origin = anchor.origin || getAnchorOrigin(anchor);
    if (origin !== window.location.origin) {
        return;
    }

    return new URL(anchor.href, anchor.baseURI);
}

function extractPath(event: MouseEvent): void | string {
    const url = extractURL(event);
    if (!url) {
        return;
    }
    return normalizeURL(url);
}

export const registerGlobalClickHandler = () => {
    window.addEventListener('click', (event: MouseEvent) => {
        if (flowReact.active) {
            return;
        }
        const url = extractURL(event);
        if (!url) {
            return;
        }
        
        if (!url.href.startsWith(document.baseURI)) {
            return;
        }
        if (event && event.preventDefault) {
            event.preventDefault();
        }

        
        const path = url.pathname + url.search + url.hash;
        const state = {...window.history.state}
        if (state.idx !== undefined) {
            state.idx = state.idx + 1;
        }
        window.history.pushState(state, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }, { capture: false });
};






function fireNavigated(pathname: string, search: string) {
    setTimeout(() => {
        window.dispatchEvent(
            new CustomEvent('vaadin-navigated', {
                detail: {
                    pathname,
                    search
                }
            })
        );
        
        delete window.Vaadin.Flow.navigation;
    });
}

function postpone() {}

const prevent = () => postpone;

type RouterContainer = Awaited<ReturnType<(typeof flow.serverSideRoutes)[0]['action']>>;

type PortalEntry = {
    readonly children: ReactNode;
    readonly domNode: HTMLElement;
};

type FlowPortalProps = React.PropsWithChildren<
    Readonly<{
        domNode: HTMLElement;
        onRemove(): void;
    }>
>;

function FlowPortal({ children, domNode, onRemove }: FlowPortalProps) {
    useEffect(() => {
        domNode.addEventListener(
            'flow-portal-remove',
            (event: Event) => {
                event.preventDefault();
                onRemove();
            },
            { once: true }
        );
    }, []);

    return createPortal(children, domNode);
}

const ADD_FLOW_PORTAL = 'ADD_FLOW_PORTAL';

type AddFlowPortalAction = Readonly<{
    type: typeof ADD_FLOW_PORTAL;
    portal: React.ReactElement<FlowPortalProps>;
}>;

function addFlowPortal(portal: React.ReactElement<FlowPortalProps>): AddFlowPortalAction {
    return {
        type: ADD_FLOW_PORTAL,
        portal
    };
}

const REMOVE_FLOW_PORTAL = 'REMOVE_FLOW_PORTAL';

type RemoveFlowPortalAction = Readonly<{
    type: typeof REMOVE_FLOW_PORTAL;
    key: string;
}>;

function removeFlowPortal(key: string): RemoveFlowPortalAction {
    return {
        type: REMOVE_FLOW_PORTAL,
        key
    };
}

function flowPortalsReducer(
    portals: readonly React.ReactElement<FlowPortalProps>[],
    action: AddFlowPortalAction | RemoveFlowPortalAction
) {
    switch (action.type) {
        case ADD_FLOW_PORTAL:
            return [...portals, action.portal];
        case REMOVE_FLOW_PORTAL:
            return portals.filter(({ key }) => key !== action.key);
        default:
            return portals;
    }
}

type NavigateOpts = {
    to: string;
    callback: boolean;
    opts?: NavigateOptions;
};

type NavigateFn = (to: string, callback: boolean, opts?: NavigateOptions) => void;

let navigateInProgress = false;





function useQueuedNavigate(
    waitReference: React.MutableRefObject<Promise<void> | undefined>,
    navigated: React.MutableRefObject<boolean>
): NavigateFn {
    const navigate = useNavigate();
    const navigateQueue = useRef<NavigateOpts[]>([]).current;
    const [navigateQueueLength, setNavigateQueueLength] = useState(0);

    const dequeueNavigation = useCallback(() => {
        if (navigateInProgress) {
            dequeueNavigationAfterCurrentTask();
            return;
        }

        const navigateArgs = navigateQueue.shift();
        if (navigateArgs === undefined) {
            
            return;
        }

        const blockingNavigate = async () => {
            if (waitReference.current) {
                await waitReference.current;
                waitReference.current = undefined;
            }
            navigated.current = !navigateArgs.callback;
            navigateInProgress = true;
            navigate(navigateArgs.to, navigateArgs.opts);
            setNavigateQueueLength(navigateQueue.length);
        };
        blockingNavigate();
    }, [navigate, setNavigateQueueLength]);

    const dequeueNavigationAfterCurrentTask = useCallback(() => {
        setTimeout(dequeueNavigation, 0);
    }, [dequeueNavigation]);

    const enqueueNavigation = useCallback(
        (to: string, callback: boolean, opts?: NavigateOptions) => {
            navigateQueue.push({ to: to, callback: callback, opts: opts });
            setNavigateQueueLength(navigateQueue.length);
            if (navigateQueue.length === 1) {
                
                
                dequeueNavigationAfterCurrentTask();
            }
        },
        [setNavigateQueueLength, dequeueNavigationAfterCurrentTask]
    );

    useEffect(
        () => () => {
            
            
            
            dequeueNavigationAfterCurrentTask();
        },
        [navigateQueueLength, dequeueNavigationAfterCurrentTask]
    );

    return enqueueNavigation;
}

const flowNavigation = () => {
  
  window.Vaadin.Flow.navigation = true;
};

function Flow() {
    const ref = useRef<HTMLOutputElement>(null);
    const navigate = useNavigate();
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        navigated.current =
            navigated.current ||
            (nextLocation.pathname === currentLocation.pathname &&
                nextLocation.search === currentLocation.search &&
                nextLocation.hash === currentLocation.hash);
        return true;
    });
    const location = useLocation();
    const navigated = useRef<boolean>(false);
    const blockerHandled = useRef<boolean>(false);
    const fromAnchor = useRef<boolean>(false);
    const containerRef = useRef<RouterContainer | undefined>(undefined);
    const roundTrip = useRef<Promise<void> | undefined>(undefined);
    const queuedNavigate = useQueuedNavigate(roundTrip, navigated);
    const basename = useHref('/');

    
    const [portals, dispatchPortalAction] = useReducer(flowPortalsReducer, []);

    const addPortalEventHandler = useCallback(
        (event: CustomEvent<PortalEntry>) => {
            event.preventDefault();

            const key = Math.random().toString(36).slice(2);
            dispatchPortalAction(
                addFlowPortal(
                    <FlowPortal
                        key={key}
                        domNode={event.detail.domNode}
                        onRemove={() => dispatchPortalAction(removeFlowPortal(key))}
                    >
                        {event.detail.children}
                    </FlowPortal>
                )
            );
        },
        [dispatchPortalAction]
    );

    const navigateEventHandler = useCallback(
        (event: MouseEvent) => {
            const path = extractPath(event);
            if (!path) {
                return;
            }

            if (event && event.preventDefault) {
                event.preventDefault();
            }
            navigated.current = false;
            // When navigation is triggered by click on a link, fromAnchor is set to true
            
            fromAnchor.current = true;
            
            window.Vaadin.Flow.navigation = true;
            navigate(path);
            
            window.dispatchEvent(new CustomEvent('close-overlay-drawer'));
        },
        [navigate]
    );

    const vaadinRouterGoEventHandler = useCallback(
        (event: CustomEvent<URL>) => {
            const url = event.detail;
            const path = normalizeURL(url);
            if (!path) {
                return;
            }

            event.preventDefault();
            navigate(path);
        },
        [navigate]
    );

    const vaadinNavigateEventHandler = useCallback(
        (event: CustomEvent<{ state: unknown; url: string; replace?: boolean; callback: boolean }>) => {
            
            window.Vaadin.Flow.navigation = true;
            
            
            const path = event.detail.url.startsWith(document.baseURI)
                ? '/' + event.detail.url.slice(document.baseURI.length)
                : '/' + event.detail.url;
            fromAnchor.current = false;
            queuedNavigate(path, event.detail.callback, { state: event.detail.state, replace: event.detail.replace });
        },
        [navigate]
    );

    const redirect = useCallback(
        (path: string) => {
            return () => {
                navigate(path, { replace: true });
            };
        },
        [navigate]
    );

    useEffect(() => {
        
        window.addEventListener('vaadin-router-go', vaadinRouterGoEventHandler);
        
        window.addEventListener('vaadin-navigate', vaadinNavigateEventHandler);

        return () => {
            
            window.removeEventListener('vaadin-router-go', vaadinRouterGoEventHandler);
            
            window.removeEventListener('vaadin-navigate', vaadinNavigateEventHandler);
        };
    }, [vaadinRouterGoEventHandler, vaadinNavigateEventHandler]);

    useEffect(() => {
        
        window.addEventListener("popstate", flowNavigation);
        window.addEventListener('click', navigateEventHandler);
        flowReact.active = true;

        return () => {
            containerRef.current?.parentNode?.removeChild(containerRef.current);
            containerRef.current?.removeEventListener('flow-portal-add', addPortalEventHandler as EventListener);
            containerRef.current = undefined;
            
            window.removeEventListener("popstate", flowNavigation);
            window.removeEventListener('click', navigateEventHandler);
            flowReact.active = false;
        };
    }, []);

    useEffect(() => {
        if (blocker.state === 'blocked') {
            if (blockerHandled.current) {
                
                
                const { pathname, state } = blocker.location;
                
                const pathNoBase = pathname.substring(basename.length);
                
                queuedNavigate(pathNoBase.startsWith('/') ? pathNoBase : '/' + pathNoBase, true, {
                    state: state,
                    replace: true
                });
                return;
            }
            blockerHandled.current = true;
            let blockingPromise: any;
            roundTrip.current = new Promise<void>(
                (resolve, reject) => (blockingPromise = { resolve: resolve, reject: reject })
            );
            
            roundTrip.current.then(
                () => (blockerHandled.current = false),
                () => (blockerHandled.current = false)
            );

            
            
            if (navigated.current && !fromAnchor.current) {
                blocker.proceed();
                blockingPromise.resolve();
                navigateInProgress = false;
                return;
            }
            fromAnchor.current = false;
            const { pathname, search } = blocker.location;
            const routes = ((window as any)?.Vaadin?.routesConfig || []) as any[];
            let matched = matchRoutes(Array.from(routes), pathname);

            
            
            if (matched && matched.filter((path) => path.route?.element?.type?.name === Flow.name).length != 0) {
                containerRef.current?.onBeforeEnter?.call(
                    containerRef?.current,
                    { pathname, search },
                    {
                        prevent() {
                            blocker.reset();
                            blockingPromise.resolve();
                            navigateInProgress = false;
                            navigated.current = false;
                        },
                        redirect,
                        continue() {
                            blocker.proceed();
                            blockingPromise.resolve();
                            navigateInProgress = false;
                        }
                    },
                    router
                );
                navigated.current = true;
            } else {
                
                Promise.resolve(
                    containerRef.current?.onBeforeLeave?.call(
                        containerRef?.current,
                        {
                            pathname,
                            search
                        },
                        { prevent },
                        router
                    )
                ).then((cmd: unknown) => {
                    if (cmd === postpone && containerRef.current) {
                        
                        containerRef.current.serverConnected = (cancel) => {
                            if (cancel) {
                                blocker.reset();
                            } else {
                                blocker.proceed();
                            }
                            blockingPromise.resolve();
                            navigateInProgress = false;
                        };
                    } else {
                        
                        blocker.proceed();
                        blockingPromise.resolve();
                        navigateInProgress = false;
                    }
                });
            }
        }
    }, [blocker.state, blocker.location]);

    useEffect(() => {
        if (blocker.state === 'blocked') {
            return;
        }
        if (navigated.current) {
            navigated.current = false;
            fireNavigated(location.pathname, location.search);
            return;
        }
        flow.serverSideRoutes[0]
            .action({ pathname: location.pathname, search: location.search })
            .then((container) => {
                const outlet = ref.current?.parentNode;
                if (outlet && outlet !== container.parentNode) {
                    outlet.append(container);
                    container.addEventListener('flow-portal-add', addPortalEventHandler as EventListener);
                    containerRef.current = container;
                }
                return container.onBeforeEnter?.call(
                    container,
                  
                    { pathname: basename + location.pathname, search: location.search },
                    {
                        prevent,
                        redirect,
                        continue() {
                            fireNavigated(location.pathname, location.search);
                        }
                    },
                    router
                );
            })
            .then((result: unknown) => {
                if (typeof result === 'function') {
                    result();
                }
            });
    }, [location]);

    return (
        <>
            <output ref={ref} style={{ display: 'none' }} />
            {portals}
        </>
    );
}
Flow.type = 'FlowContainer'; // This is for copilot to recognize this

export const serverSideRoutes = [{ path: '/*', element: <Flow /> }];








export const loadComponentScript = (tag: String): Promise<void> => {
    return new Promise((resolve, reject) => {
        useEffect(() => {
            const script = document.createElement('script');
            script.src = `/web-component/${tag}.js`;
            script.onload = function () {
                resolve();
            };
            script.onerror = function (err) {
                reject(err);
            };
            document.head.appendChild(script);

            return () => {
                document.head.removeChild(script);
            };
        }, []);
    });
};

interface Properties {
    [key: string]: string;
}









export const reactElement = (tag: string, props?: Properties, onload?: () => void, onerror?: (err: any) => void) => {
    loadComponentScript(tag).then(
        () => onload?.(),
        (err) => {
            if (onerror) {
                onerror(err);
            } else {
                console.error(`Failed to load script for ${tag}.`, err);
            }
        }
    );

    if (props) {
        return React.createElement(tag, props);
    }
    return React.createElement(tag);
};

export default Flow;


if (import.meta.hot) {
    
    import.meta.hot.accept((newModule) => {
        
        
        
        
        if (newModule) {
            window.location.reload();
        }
    });
}
