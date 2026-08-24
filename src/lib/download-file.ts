export async function downloadFile(
  url: string,
  options: RequestInit,
  fallbackName: string,
) {
  const response =
    await fetch(
      url,
      options,
    );

  if (!response.ok) {
    let message =
      "Download failed.";

    try {
      const data =
        await response.json();

      if (
        typeof data.error ===
          "string"
      ) {
        message = data.error;
      }
    } catch {
    }

    throw new Error(
      message,
    );
  }

  const blob =
    await response.blob();

  const disposition =
    response.headers.get(
      "Content-Disposition",
    );

  const match =
    disposition?.match(
      /filename="([^"]+)"/,
    );

  const filename =
    match?.[1] ??
    fallbackName;

  const objectUrl =
    URL.createObjectURL(
      blob,
    );

  const anchor =
    document.createElement(
      "a",
    );

  anchor.href = objectUrl;
  anchor.download = filename;

  document.body.appendChild(
    anchor,
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(
    objectUrl,
  );
}
