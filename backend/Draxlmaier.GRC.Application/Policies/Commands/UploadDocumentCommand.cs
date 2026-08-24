using System;
using System.IO;
using Draxlmaier.GRC.Application.Policies.DTOs;
using MediatR;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public class UploadDocumentCommand : IRequest<DocumentDto>
{
    public Guid OrganizationId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Filename { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public Stream Content { get; set; } = Stream.Null;
}
