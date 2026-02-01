<script lang="ts">
  type Props = {
    size?: number | string;
    class?: string;
    style?: string;
  };

  let {
    size = 16,
    class: className = '',
    style
  }: Props = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="wpea-icon wpea-icon--moon {className}"
  {style}
  aria-hidden="true"
>
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
</svg>
