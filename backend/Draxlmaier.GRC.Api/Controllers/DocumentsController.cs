using System;
using System.IO;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Policies.Commands;
using Draxlmaier.GRC.Application.Policies.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Administrator,ComplianceOfficer")]
public class DocumentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DocumentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<DocumentDto>> UploadDocument(
        [FromForm] Guid organizationId, 
        IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty.");

        // We create a memory stream or pass the OpenReadStream()
        // But for better control, we might want to copy to a memory stream
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

        var command = new UploadDocumentCommand
        {
            OrganizationId = organizationId,
            Filename = file.FileName,
            ContentType = file.ContentType,
            Content = memoryStream
        };

        var documentDto = await _mediator.Send(command);
        return Ok(documentDto);
    }

    [HttpGet("{id}/download")]
    public async Task<ActionResult> DownloadDocument(Guid id)
    {
        var result = await _mediator.Send(new Draxlmaier.GRC.Application.Policies.Queries.DownloadDocumentQuery(id));
        if (result == null) return NotFound();

        return File(result.Content, result.ContentType, result.Filename);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDocument(Guid id)
    {
        var result = await _mediator.Send(new DeleteDocumentCommand(id));
        if (!result) return NotFound();

        return NoContent();
    }
}
