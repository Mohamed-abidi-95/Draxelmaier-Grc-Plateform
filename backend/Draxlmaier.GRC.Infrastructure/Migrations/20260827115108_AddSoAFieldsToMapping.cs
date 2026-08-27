using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Draxlmaier.GRC.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoAFieldsToMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsApplicable",
                table: "ControlMappings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Justification",
                table: "ControlMappings",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsApplicable",
                table: "ControlMappings");

            migrationBuilder.DropColumn(
                name: "Justification",
                table: "ControlMappings");
        }
    }
}
