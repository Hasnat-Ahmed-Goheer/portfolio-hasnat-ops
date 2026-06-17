/**
 * Minimal focus trap for modal dialogs (the ⌘K palette + the terminal). Call
 * from the dialog container's onKeyDown: on Tab/Shift+Tab at the edge of the
 * focusable set, wrap to the other end so focus can't escape to the page
 * behind the dimmer. Keeps both `aria-modal` dialogs honestly modal.
 */
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])';

export function trapTab(e: React.KeyboardEvent, container: HTMLElement | null) {
  if (e.key !== "Tab" || !container) return;
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE)
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (nodes.length === 0) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}
