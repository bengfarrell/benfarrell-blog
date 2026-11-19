const printButton = document.querySelector("[data-resume-print]");

if (printButton) {
	printButton.hidden = false;
	printButton.addEventListener("click", () => window.print());
}
