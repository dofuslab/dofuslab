import { ParsedRequest } from "../api/_lib/types";
const { H, R, copee } = window as any;
let timeout = -1;

interface ImagePreviewProps {
  src: string;
  onclick: () => void;
  onload: () => void;
  onerror: () => void;
  loading: boolean;
}

const ImagePreview = ({
  src,
  onclick,
  onload,
  onerror,
  loading,
}: ImagePreviewProps) => {
  const style = {
    filter: loading ? "blur(5px)" : "",
    opacity: loading ? 0.1 : 1,
  };
  const title = "Click to copy image URL to clipboard";
  return H(
    "a",
    { className: "image-wrapper", href: src, onclick },
    H("img", { src, onload, onerror, style, title })
  );
};

interface TextInputProps {
  value: string;
  oninput: (val: string) => void;
}

const TextInput = ({ value, oninput }: TextInputProps) => {
  return H(
    "div",
    { className: "input-outer-wrapper" },
    H(
      "div",
      { className: "input-inner-wrapper" },
      H("input", {
        type: "text",
        value,
        oninput: (e: any) => oninput(e.target.value),
      })
    )
  );
};

interface ButtonProps {
  label: string;
  onclick: () => void;
}

const Button = ({ label, onclick }: ButtonProps) => {
  return H("button", { onclick }, label);
};

interface FieldProps {
  label: string;
  input: any;
}

const Field = ({ label, input }: FieldProps) => {
  return H(
    "div",
    { className: "field" },
    H(
      "label",
      H("div", { className: "field-label" }, label),
      H("div", { className: "field-value" }, input)
    )
  );
};

interface ToastProps {
  show: boolean;
  message: string;
}

const Toast = ({ show, message }: ToastProps) => {
  const style = { transform: show ? "translate3d(0,-0px,-0px) scale(1)" : "" };
  return H(
    "div",
    { className: "toast-area" },
    H(
      "div",
      { className: "toast-outer", style },
      H(
        "div",
        { className: "toast-inner" },
        H("div", { className: "toast-message" }, message)
      )
    )
  );
};

interface AppState extends ParsedRequest {
  loading: boolean;
  showToast: boolean;
  messageToast: string;
  widths: string[];
  heights: string[];
  overrideUrl: URL | null;
}

type SetState = (state: Partial<AppState>) => void;

const App = (_: any, state: AppState, setState: SetState) => {
  const setLoadingState = (newState: Partial<AppState>) => {
    window.clearTimeout(timeout);
    if (state.overrideUrl && state.overrideUrl !== newState.overrideUrl) {
      newState.overrideUrl = state.overrideUrl;
    }
    if (newState.overrideUrl) {
      timeout = window.setTimeout(() => setState({ overrideUrl: null }), 200);
    }

    setState({ ...newState, loading: true });
  };
  const {
    text = "**Hello** World",
    items = [],
    showToast = false,
    messageToast = "",
    loading = true,
    overrideUrl = null,
  } = state;
  const url = new URL(window.location.origin);
  url.pathname = `${encodeURIComponent(text)}`;
  for (let item of items) {
    url.searchParams.append("items", item);
  }

  return H(
    "div",
    { className: "split" },
    H(
      "div",
      { className: "pull-left" },
      H(
        "div",
        H(Field, {
          label: "Text Input",
          input: H(TextInput, {
            value: text,
            oninput: (val: string) => {
              console.log("oninput " + val);
              setLoadingState({ text: val, overrideUrl: url });
            },
          }),
        }),
        ...items.map((item, i) =>
          H(Field, {
            label: `Image ${i + 1}`,
            input: H(
              "div",
              H(TextInput, {
                value: item,
                oninput: (val: string) => {
                  let clone = [...items];
                  clone[i] = val;
                  setLoadingState({ items: clone, overrideUrl: url });
                },
              })
            ),
          })
        ),
        H(Field, {
          label: `Item ${items.length + 1}`,
          input: H(Button, {
            label: `Add Item ${items.length + 1}`,
            onclick: () => {
              setLoadingState({ items: [...items, ""] });
            },
          }),
        })
      )
    ),
    H(
      "div",
      { className: "pull-right" },
      H(ImagePreview, {
        src: overrideUrl ? overrideUrl.href : url.href,
        loading: loading,
        onload: () => setState({ loading: false }),
        onerror: () => {
          setState({
            showToast: true,
            messageToast: "Oops, an error occurred",
          });
          setTimeout(() => setState({ showToast: false }), 2000);
        },
        onclick: (e: Event) => {
          e.preventDefault();
          const success = copee.toClipboard(url.href);
          if (success) {
            setState({
              showToast: true,
              messageToast: "Copied image URL to clipboard",
            });
            setTimeout(() => setState({ showToast: false }), 3000);
          } else {
            window.open(url.href, "_blank");
          }
          return false;
        },
      })
    ),
    H(Toast, {
      message: messageToast,
      show: showToast,
    })
  );
};

R(H(App), document.getElementById("app"));
