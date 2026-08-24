using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Common.Interfaces;

public interface IFileStorage
{
    /// <summary>
    /// Uploads a file stream to the storage.
    /// </summary>
    /// <param name="storageKey">The logical key/path for the file (e.g., tenant/123/docs/abc.pdf).</param>
    /// <param name="content">The file stream.</param>
    /// <param name="contentType">The MIME type of the file.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    Task UploadAsync(string storageKey, Stream content, string contentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a file stream from the storage.
    /// </summary>
    /// <param name="storageKey">The logical key/path for the file.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The file stream.</returns>
    Task<Stream> DownloadAsync(string storageKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file from the storage.
    /// </summary>
    /// <param name="storageKey">The logical key/path for the file.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default);
}
