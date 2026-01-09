import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepButton from '@mui/material/StepButton';
import Box from '@mui/material/Box';

export const StepperFlow = ({ steps = [], activeStep = 0, onStepChange }) => (
  <Box>
    <Stepper alternativeLabel activeStep={activeStep}>
      {steps.map((label, index) => (
        <Step key={label} completed={index < activeStep}>
          {onStepChange ? (
            <StepButton color="inherit" onClick={() => onStepChange(index)}>
              {label}
            </StepButton>
          ) : (
            <StepLabel>{label}</StepLabel>
          )}
        </Step>
      ))}
    </Stepper>
  </Box>
);

