using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Compliance.Commands;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Draxlmaier.GRC.Application.UnitTests.Compliance.Commands
{
    public class CreateControlMappingCommandHandlerTests
    {
        private readonly Mock<IApplicationDbContext> _contextMock;
        private readonly Mock<DbSet<ControlMapping>> _dbSetMock;
        private readonly CreateControlMappingCommandHandler _handler;

        public CreateControlMappingCommandHandlerTests()
        {
            _contextMock = new Mock<IApplicationDbContext>();
            _dbSetMock = new Mock<DbSet<ControlMapping>>();

            _contextMock.Setup(c => c.ControlMappings).Returns(_dbSetMock.Object);
            
            _handler = new CreateControlMappingCommandHandler(_contextMock.Object);
        }

        [Fact]
        public async Task Handle_ShouldThrowArgumentException_WhenBothPolicyAndControlIdsAreNull()
        {
            // Arrange
            var command = new CreateControlMappingCommand
            {
                RequirementId = Guid.NewGuid(),
                PolicyId = null,
                ControlId = null
            };

            // Act
            Func<Task> action = async () => await _handler.Handle(command, CancellationToken.None);

            // Assert
            await action.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Either PolicyId or ControlId must be provided.");
        }

        [Fact]
        public async Task Handle_ShouldAddMappingAndSaveChanges_WhenPolicyIdIsProvided()
        {
            // Arrange
            var command = new CreateControlMappingCommand
            {
                RequirementId = Guid.NewGuid(),
                PolicyId = Guid.NewGuid(),
                ControlId = null,
                Status = "Compliant"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _dbSetMock.Verify(db => db.Add(It.Is<ControlMapping>(m => 
                m.RequirementId == command.RequirementId &&
                m.PolicyId == command.PolicyId &&
                m.Status == ComplianceStatus.Compliant &&
                m.Origin == MappingOrigin.Manual
            )), Times.Once);

            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            result.Should().NotBeEmpty();
        }

        [Fact]
        public async Task Handle_ShouldAddMappingAndSaveChanges_WhenControlIdIsProvided()
        {
            // Arrange
            var command = new CreateControlMappingCommand
            {
                RequirementId = Guid.NewGuid(),
                PolicyId = null,
                ControlId = Guid.NewGuid(),
                Status = "NotAssessed"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _dbSetMock.Verify(db => db.Add(It.Is<ControlMapping>(m => 
                m.RequirementId == command.RequirementId &&
                m.ControlId == command.ControlId &&
                m.Status == ComplianceStatus.NotAssessed &&
                m.Origin == MappingOrigin.Manual
            )), Times.Once);

            _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
            result.Should().NotBeEmpty();
        }
    }
}
