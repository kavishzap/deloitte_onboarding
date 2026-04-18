/** Full-width proposal section below the workflow (Software Application Proposal Agent output). */
export const SOFTWARE_PROPOSAL_OUTPUT_SECTION_ID = "software-proposal-output-section"

export function scrollToSoftwareProposalOutput() {
  window.setTimeout(() => {
    document.getElementById(SOFTWARE_PROPOSAL_OUTPUT_SECTION_ID)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }, 150)
}
