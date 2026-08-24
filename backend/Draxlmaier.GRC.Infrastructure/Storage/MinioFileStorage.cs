using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using Draxlmaier.GRC.Application.Common.Interfaces;

namespace Draxlmaier.GRC.Infrastructure.Storage;

public class MinioFileStorage : IFileStorage
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName = "grc-documents";

    public MinioFileStorage(IAmazonS3 s3Client)
    {
        _s3Client = s3Client;
    }

    public async Task UploadAsync(string storageKey, Stream content, string contentType, CancellationToken cancellationToken = default)
    {
        try
        {
            var bucketExists = await Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(_s3Client, _bucketName);
            if (!bucketExists)
            {
                var putBucketRequest = new PutBucketRequest { BucketName = _bucketName, UseClientRegion = true };
                await _s3Client.PutBucketAsync(putBucketRequest, cancellationToken);
            }
        }
        catch { /* Ignore and let PutObject fail if it truly doesn't exist */ }

        var putRequest = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = storageKey,
            InputStream = content,
            ContentType = contentType
        };

        await _s3Client.PutObjectAsync(putRequest, cancellationToken);
    }

    public async Task<Stream> DownloadAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var getRequest = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = storageKey
        };

        var response = await _s3Client.GetObjectAsync(getRequest, cancellationToken);
        return response.ResponseStream;
    }

    public async Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = storageKey
        };

        await _s3Client.DeleteObjectAsync(deleteRequest, cancellationToken);
    }
}
