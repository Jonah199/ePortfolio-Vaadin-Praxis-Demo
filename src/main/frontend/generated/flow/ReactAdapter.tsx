














import { createRoot, Root } from 'react-dom/client';
import { createElement, type Dispatch, type ReactElement, type ReactNode, useEffect, useReducer } from 'react';

type FlowStateKeyChangedAction<K extends string, V> = Readonly<{
    type: 'stateKeyChanged';
    key: K;
    value: V;
}>;

type FlowStateReducerAction = FlowStateKeyChangedAction<string, unknown>;

function stateReducer<S extends Readonly<Record<string, unknown>>>(state: S, action: FlowStateReducerAction): S {
    switch (action.type) {
        case 'stateKeyChanged':
            const { value } = action;
            return {
                ...state,
                key: value
            } as S;
        default:
            return state;
    }
}

type DispatchEvent<T> = T extends undefined ? () => boolean : (value: T) => boolean;

const emptyAction: Dispatch<unknown> = () => {};





export type RenderHooks = {
    














    readonly useState: ReactAdapterElement['useState'];

    













    readonly useCustomEvent: ReactAdapterElement['useCustomEvent'];

    


















    readonly useContent: ReactAdapterElement['useContent'];
};

interface ReadyCallbackFunction {
    (): void;
}






export abstract class ReactAdapterElement extends HTMLElement {
    #root: Root | undefined = undefined;
    #rootRendered: boolean = false;
    #rendering: ReactNode | undefined = undefined;

    #state: Record<string, unknown> = Object.create(null);
    #stateSetters = new Map<string, Dispatch<unknown>>();
    #customEvents = new Map<string, DispatchEvent<unknown>>();
    #dispatchFlowState: Dispatch<FlowStateReducerAction> = emptyAction;

    #readyCallback = new Map<string, ReadyCallbackFunction>();

    readonly #renderHooks: RenderHooks;

    readonly #Wrapper: () => ReactElement | null;

    #unmounting?: Promise<void>;

    constructor() {
        super();
        this.#renderHooks = {
            useState: this.useState.bind(this),
            useCustomEvent: this.useCustomEvent.bind(this),
            useContent: this.useContent.bind(this)
        };
        this.#Wrapper = this.#renderWrapper.bind(this);
        this.#markAsUsed();
    }

    public async connectedCallback() {
        this.#rendering = createElement(this.#Wrapper);
        const createNewRoot = this.dispatchEvent(
            new CustomEvent('flow-portal-add', {
                bubbles: true,
                cancelable: true,
                composed: true,
                detail: {
                    children: this.#rendering,
                    domNode: this
                }
            })
        );

        if (!createNewRoot || this.#root) {
            return;
        }

        await this.#unmounting;

        this.#root = createRoot(this);
        this.#maybeRenderRoot();
        this.#root.render(this.#rendering);
    }

    









    public addReadyCallback(id: string, readyCallback: ReadyCallbackFunction) {
        this.#readyCallback.set(id, readyCallback);
    }

    public async disconnectedCallback() {
        if (!this.#root) {
            this.dispatchEvent(
                new CustomEvent('flow-portal-remove', {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    detail: {
                        children: this.#rendering,
                        domNode: this
                    }
                })
            );
        } else {
            this.#unmounting = Promise.resolve();
            await this.#unmounting;
            this.#root.unmount();
            this.#root = undefined;
        }
        this.#rootRendered = false;
        this.#rendering = undefined;
    }

    














    protected useState<T>(key: string, initialValue?: T): [value: T, setValue: Dispatch<T>] {
        if (this.#stateSetters.has(key)) {
            return [this.#state[key] as T, this.#stateSetters.get(key)!];
        }

        const value = ((this as Record<string, unknown>)[key] as T) ?? initialValue!;
        this.#state[key] = value;
        Object.defineProperty(this, key, {
            enumerable: true,
            get(): T {
                return this.#state[key];
            },
            set(nextValue: T) {
                this.#state[key] = nextValue;
                this.#dispatchFlowState({ type: 'stateKeyChanged', key, value });
            }
        });

        const dispatchChangedEvent = this.useCustomEvent<{ value: T }>(`${key}-changed`, { detail: { value } });
        const setValue = (value: T) => {
            this.#state[key] = value;
            dispatchChangedEvent({ value });
            this.#dispatchFlowState({ type: 'stateKeyChanged', key, value });
        };
        this.#stateSetters.set(key, setValue as Dispatch<unknown>);
        return [value, setValue];
    }

    













    protected useCustomEvent<T = undefined>(type: string, options: CustomEventInit<T> = {}): DispatchEvent<T> {
        if (!this.#customEvents.has(type)) {
            const dispatch = ((detail?: T) => {
                const eventInitDict =
                    detail === undefined
                        ? options
                        : {
                            ...options,
                            detail
                        };
                const event = new CustomEvent(type, eventInitDict);
                return this.dispatchEvent(event);
            }) as DispatchEvent<T>;
            this.#customEvents.set(type, dispatch as DispatchEvent<unknown>);
            return dispatch;
        }
        return this.#customEvents.get(type)! as DispatchEvent<T>;
    }

    





    protected abstract render(hooks: RenderHooks): ReactElement | null;

    





    protected useContent(name: string): ReactElement | null {
        useEffect(() => {
            this.#readyCallback.get(name)?.();
        }, []);
        return createElement('flow-content-container', { name, style: { display: 'contents' } });
    }

    #maybeRenderRoot() {
        if (this.#rootRendered || !this.#root) {
            return;
        }

        this.#root.render(createElement(this.#Wrapper));
        this.#rootRendered = true;
    }

    #renderWrapper(): ReactElement | null {
        const [state, dispatchFlowState] = useReducer(stateReducer, this.#state);
        this.#state = state;
        this.#dispatchFlowState = dispatchFlowState;
        return this.render(this.#renderHooks);
    }

    #markAsUsed(): void {
        
        let vaadinObject = window.Vaadin || {};
        
        if (vaadinObject.developmentMode) {
            vaadinObject.registrations = vaadinObject.registrations || [];
            vaadinObject.registrations.push({
                is: 'ReactAdapterElement',
                version: '25.1.0'
            });
        }
    }
}
