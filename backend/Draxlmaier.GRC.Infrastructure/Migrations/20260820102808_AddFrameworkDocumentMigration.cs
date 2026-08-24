using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Draxlmaier.GRC.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFrameworkDocumentMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DocumentId",
                table: "ComplianceFrameworks",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceFrameworks_DocumentId",
                table: "ComplianceFrameworks",
                column: "DocumentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ComplianceFrameworks_Documents_DocumentId",
                table: "ComplianceFrameworks",
                column: "DocumentId",
                principalTable: "Documents",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ComplianceFrameworks_Documents_DocumentId",
                table: "ComplianceFrameworks");

            migrationBuilder.DropIndex(
                name: "IX_ComplianceFrameworks_DocumentId",
                table: "ComplianceFrameworks");

            migrationBuilder.DropColumn(
                name: "DocumentId",
                table: "ComplianceFrameworks");
        }
    }
}
