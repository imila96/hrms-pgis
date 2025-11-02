// src/components/Login/BusinessAvatar.js
import React, { useState, useEffect } from "react";
import { Box, Zoom, keyframes } from "@mui/material";

/**
 * BusinessAvatar Component
 * A reusable 3D-style business character that reacts to user interactions
 * Features:
 * - Eye tracking (follows mouse/focus)
 * - Blinks naturally
 * - Covers eyes during password input
 * - Shows error/success emotions
 * - Breathing animation
 */
const BusinessAvatar = ({ 
  focusedField = "", 
  isError = false, 
  isSuccess = false,
  isLoading = false,
  mousePosition = { x: 0, y: 0 },
  hasPassword = false
}) => {
  const [eyesClosed, setEyesClosed] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

  // Determine if password field should trigger eye covering
  // Cover eyes ONLY when actively in the password field
  const shouldCoverEyes = focusedField === "password";

  // Natural blinking animation
  useEffect(() => {
    if (!shouldCoverEyes) {
      const blinkInterval = setInterval(() => {
        setEyesClosed(true);
        setTimeout(() => setEyesClosed(false), 150);
      }, 3500);
      return () => clearInterval(blinkInterval);
    }
  }, [shouldCoverEyes]);

  // Eye tracking - follows mouse movement
  useEffect(() => {
    if (!shouldCoverEyes && !eyesClosed) {
      const maxMove = 15; // Maximum eye movement in pixels - increased for better visibility
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const deltaX = (mousePosition.x - centerX) / centerX;
      const deltaY = (mousePosition.y - centerY) / centerY;
      
      setEyePosition({
        x: deltaX * maxMove,
        y: deltaY * maxMove
      });
    } else if (shouldCoverEyes) {
      setEyePosition({ x: 0, y: 0 });
    }
  }, [mousePosition, shouldCoverEyes, eyesClosed]);

  // Animation keyframes
  const breathe = keyframes`
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-8px) scale(1.02); }
  `;

  const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  `;

  const shake = keyframes`
    0%, 100% { transform: translateX(0) rotate(0deg); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px) rotate(-2deg); }
    20%, 40%, 60%, 80% { transform: translateX(8px) rotate(2deg); }
  `;

  const wiggle = keyframes`
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  `;

  const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `;

  const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  `;

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        pointerEvents: "none",
        transform: "scale(0.85)", // Slightly smaller for side placement
      }}
    >
      {/* Character Container with 3D effect */}
      <Box
        sx={{
          position: "relative",
          width: 180,
          height: 240,
          animation: isError 
            ? `${shake} 0.5s ease` 
            : isSuccess 
            ? `${bounce} 0.6s ease` 
            : `${breathe} 4s ease-in-out infinite`,
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
      >
        {/* Main Character Body - Business Suit */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 140,
            height: 160,
            background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
            borderRadius: "80px 80px 20px 20px",
            boxShadow: "0 10px 40px rgba(30, 58, 138, 0.4)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 50,
              height: 100,
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: "25px 25px 15px 15px",
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.1)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: "35%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 20,
              height: 60,
              background: "linear-gradient(180deg, #1e40af 0%, #2563eb 100%)",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            },
          }}
        >
          {/* Collar */}
          <Box
            sx={{
              position: "absolute",
              top: "25%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderTop: "20px solid #ffffff",
            }}
          />
        </Box>

        {/* Character Head */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
            border: "4px solid #1e40af",
            zIndex: 2,
          }}
        >
          {/* Hair */}
          <Box
            sx={{
              position: "absolute",
              top: -15,
              left: "50%",
              transform: "translateX(-50%)",
              width: 100,
              height: 60,
              background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
              borderRadius: "50px 50px 40px 40px",
              boxShadow: "inset 0 -5px 15px rgba(0,0,0,0.3)",
            }}
          >
            {/* Hair details */}
            <Box sx={{ 
              position: "absolute", 
              top: 10, 
              left: 15, 
              width: 25, 
              height: 30, 
              background: "linear-gradient(90deg, #111827 0%, #1f2937 100%)",
              borderRadius: "50% 0 50% 50%",
              transform: "rotate(-10deg)",
            }} />
            <Box sx={{ 
              position: "absolute", 
              top: 8, 
              right: 15, 
              width: 25, 
              height: 30, 
              background: "linear-gradient(90deg, #1f2937 0%, #111827 100%)",
              borderRadius: "0 50% 50% 50%",
              transform: "rotate(10deg)",
            }} />
          </Box>

          {/* Ears */}
          <Box
            sx={{
              position: "absolute",
              top: 45,
              left: -15,
              width: 25,
              height: 30,
              background: "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)",
              borderRadius: "50%",
              boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <Box sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-30%, -50%)",
              width: 10,
              height: 15,
              background: "#fbbf24",
              borderRadius: "50%",
            }} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: 45,
              right: -15,
              width: 25,
              height: 30,
              background: "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)",
              borderRadius: "50%",
              boxShadow: "inset -2px 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <Box sx={{
              position: "absolute",
              top: "50%",
              right: "50%",
              transform: "translate(30%, -50%)",
              width: 10,
              height: 15,
              background: "#fbbf24",
              borderRadius: "50%",
            }} />
          </Box>

          {/* Eyebrows */}
          <Box
            sx={{
              position: "absolute",
              top: 35,
              left: 25,
              width: 22,
              height: 5,
              background: "#1f2937",
              borderRadius: "50%",
              transform: isError ? "rotate(-20deg)" : focusedField === "email" ? "rotate(5deg)" : "rotate(-5deg)",
              transition: "all 0.3s ease",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 35,
              right: 25,
              width: 22,
              height: 5,
              background: "#1f2937",
              borderRadius: "50%",
              transform: isError ? "rotate(20deg)" : focusedField === "email" ? "rotate(-5deg)" : "rotate(5deg)",
              transition: "all 0.3s ease",
            }}
          />

          {/* Eyes Container */}
          <Box sx={{ 
            position: "relative",
            display: "flex", 
            justifyContent: "center", 
            gap: 4.5, 
            mt: "50px" 
          }}>
            {/* Left Eye */}
            <Box
              sx={{
                position: "relative",
                width: 28,
                height: 28,
                background: "#ffffff",
                borderRadius: "50%",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Pupil */}
              {!eyesClosed && !shouldCoverEyes && (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    background: "radial-gradient(circle at 30% 30%, #3b82f6, #1e40af)",
                    borderRadius: "50%",
                    position: "relative",
                    transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                    transition: "transform 0.15s ease-out",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Reflection */}
                  <Box sx={{
                    position: "absolute",
                    top: 3,
                    left: 4,
                    width: 5,
                    height: 5,
                    background: "#ffffff",
                    borderRadius: "50%",
                    opacity: 0.9,
                  }} />
                </Box>
              )}
              {/* Closed eye line */}
              {eyesClosed && (
                <Box sx={{
                  width: "80%",
                  height: 3,
                  background: "#1f2937",
                  borderRadius: "50%",
                }} />
              )}
            </Box>

            {/* Right Eye */}
            <Box
              sx={{
                position: "relative",
                width: 28,
                height: 28,
                background: "#ffffff",
                borderRadius: "50%",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Pupil */}
              {!eyesClosed && !shouldCoverEyes && (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    background: "radial-gradient(circle at 30% 30%, #3b82f6, #1e40af)",
                    borderRadius: "50%",
                    position: "relative",
                    transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                    transition: "transform 0.15s ease-out",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Reflection */}
                  <Box sx={{
                    position: "absolute",
                    top: 3,
                    left: 4,
                    width: 5,
                    height: 5,
                    background: "#ffffff",
                    borderRadius: "50%",
                    opacity: 0.9,
                  }} />
                </Box>
              )}
              {/* Closed eye line */}
              {eyesClosed && (
                <Box sx={{
                  width: "80%",
                  height: 3,
                  background: "#1f2937",
                  borderRadius: "50%",
                }} />
              )}
            </Box>
          </Box>

          {/* Hands covering eyes when typing password */}
          {shouldCoverEyes && (
            <>
              <Zoom in={true} timeout={300}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 40,
                    left: -35,
                    width: 55,
                    height: 55,
                    background: "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)",
                    borderRadius: "50%",
                    border: "3px solid #1e40af",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                    animation: `${wiggle} 0.6s ease-in-out infinite`,
                    zIndex: 5,
                  }}
                >
                  {/* Fingers */}
                  <Box sx={{
                    position: "absolute",
                    top: -5,
                    left: 12,
                    width: 8,
                    height: 20,
                    background: "#fbbf24",
                    borderRadius: "4px 4px 0 0",
                    boxShadow: "2px 0 0 #f59e0b",
                  }} />
                  <Box sx={{
                    position: "absolute",
                    top: -8,
                    left: 22,
                    width: 8,
                    height: 23,
                    background: "#fbbf24",
                    borderRadius: "4px 4px 0 0",
                    boxShadow: "2px 0 0 #f59e0b",
                  }} />
                  <Box sx={{
                    position: "absolute",
                    top: -5,
                    left: 32,
                    width: 8,
                    height: 20,
                    background: "#fbbf24",
                    borderRadius: "4px 4px 0 0",
                  }} />
                </Box>
              </Zoom>
              <Zoom in={true} timeout={300}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 40,
                    right: -35,
                    width: 55,
                    height: 55,
                    background: "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)",
                    borderRadius: "50%",
                    border: "3px solid #1e40af",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                    animation: `${wiggle} 0.6s ease-in-out infinite`,
                    zIndex: 5,
                  }}
                >
                  {/* Fingers */}
                  <Box sx={{
                    position: "absolute",
                    top: -5,
                    right: 12,
                    width: 8,
                    height: 20,
                    background: "#fbbf24",
                    borderRadius: "4px 4px 0 0",
                    boxShadow: "-2px 0 0 #f59e0b",
                  }} />
                  <Box sx={{
                    position: "absolute",
                    top: -8,
                    right: 22,
                    width: 8,
                    height: 23,
                    background: "#fbbf24",
                    borderRadius: "4px 4px 0 0",
                    boxShadow: "-2px 0 0 #f59e0b",
                  }} />
                  <Box sx={{
                    position: "absolute",
                    top: -5,
                    right: 32,
                    width: 8,
                    height: 20,
                    background: "#fbbf24",
                    borderRadius: "4px 4px 0 0",
                  }} />
                </Box>
              </Zoom>
            </>
          )}

          {/* Nose */}
          <Box
            sx={{
              position: "absolute",
              bottom: 35,
              left: "50%",
              transform: "translateX(-50%)",
              width: 12,
              height: 18,
              background: "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)",
              borderRadius: "50% 50% 50% 50%",
              boxShadow: "inset -2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Box sx={{
              position: "absolute",
              bottom: 2,
              left: 2,
              width: 4,
              height: 4,
              background: "#d97706",
              borderRadius: "50%",
            }} />
            <Box sx={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 4,
              height: 4,
              background: "#d97706",
              borderRadius: "50%",
            }} />
          </Box>

          {/* Mouth */}
          <Box
            sx={{
              position: "absolute",
              bottom: 15,
              left: "50%",
              transform: "translateX(-50%)",
              width: isSuccess ? 45 : isError ? 35 : 40,
              height: isSuccess ? 25 : isError ? 4 : 20,
              borderRadius: isError ? "50%" : "0 0 50px 50px",
              background: isError 
                ? "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)"
                : isSuccess 
                ? "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)"
                : (isLoading ? "#6366f1" : "#f59e0b"),
              transition: "all 0.3s ease",
              overflow: "hidden",
              boxShadow: "inset 0 -2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {/* Teeth when success */}
            {isSuccess && (
              <Box sx={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "80%",
                height: "50%",
                background: "#ffffff",
                borderRadius: "0 0 10px 10px",
              }} />
            )}
            {/* Tongue animation */}
            {!isError && !isSuccess && focusedField && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 12,
                  background: "#ef4444",
                  borderRadius: "50%",
                  animation: `${pulse} 1s ease infinite`,
                }}
              />
            )}
          </Box>

          {/* Blush */}
          {focusedField === "email" && !isError && (
            <>
              <Box
                sx={{
                  position: "absolute",
                  top: 65,
                  left: 12,
                  width: 22,
                  height: 18,
                  background: "radial-gradient(circle, rgba(239, 68, 68, 0.4), transparent)",
                  borderRadius: "50%",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 65,
                  right: 12,
                  width: 22,
                  height: 18,
                  background: "radial-gradient(circle, rgba(239, 68, 68, 0.4), transparent)",
                  borderRadius: "50%",
                }}
              />
            </>
          )}

          {/* Sweat drops when error */}
          {isError && (
            <>
              <Box
                sx={{
                  position: "absolute",
                  top: 30,
                  right: 15,
                  width: 8,
                  height: 12,
                  background: "#3b82f6",
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(45deg)",
                  animation: `${pulse} 0.5s ease infinite`,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 45,
                  right: 10,
                  width: 6,
                  height: 9,
                  background: "#3b82f6",
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(45deg)",
                  animation: `${pulse} 0.5s ease infinite 0.2s`,
                }}
              />
            </>
          )}
        </Box>

        {/* Arms on hips (confident pose) */}
        <Box
          sx={{
            position: "absolute",
            bottom: 50,
            left: -5,
            width: 35,
            height: 80,
            background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
            borderRadius: "20px 10px 10px 20px",
            transform: "rotate(-15deg)",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
          }}
        >
          {/* Hand */}
          <Box sx={{
            position: "absolute",
            bottom: -5,
            left: -8,
            width: 25,
            height: 25,
            background: "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)",
            borderRadius: "50%",
            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
          }} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 50,
            right: -5,
            width: 35,
            height: 80,
            background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
            borderRadius: "10px 20px 20px 10px",
            transform: "rotate(15deg)",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
          }}
        >
          {/* Hand */}
          <Box sx={{
            position: "absolute",
            bottom: -5,
            right: -8,
            width: 25,
            height: 25,
            background: "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)",
            borderRadius: "50%",
            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
          }} />
        </Box>

        {/* Legs */}
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 2,
          }}
        >
          {/* Left Leg */}
          <Box sx={{
            width: 32,
            height: 55,
            background: "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)",
            borderRadius: "15px 15px 0 0",
            position: "relative",
          }}>
            {/* Shoe */}
            <Box sx={{
              position: "absolute",
              bottom: -12,
              left: -3,
              width: 38,
              height: 15,
              background: "#1f2937",
              borderRadius: "15px 15px 5px 5px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
            }} />
          </Box>
          {/* Right Leg */}
          <Box sx={{
            width: 32,
            height: 55,
            background: "linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)",
            borderRadius: "15px 15px 0 0",
            position: "relative",
          }}>
            {/* Shoe */}
            <Box sx={{
              position: "absolute",
              bottom: -12,
              right: -3,
              width: 38,
              height: 15,
              background: "#1f2937",
              borderRadius: "15px 15px 5px 5px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
            }} />
          </Box>
        </Box>

        {/* Loading spinner around character */}
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 220,
              height: 220,
              border: "4px solid rgba(30, 64, 175, 0.2)",
              borderTop: "4px solid #1e40af",
              borderRadius: "50%",
              animation: `${spin} 1s linear infinite`,
            }}
          />
        )}

        {/* Success checkmark effect */}
        {isSuccess && (
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 50,
              height: 50,
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(34, 197, 94, 0.4)",
              animation: `${bounce} 0.6s ease`,
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 20,
                borderBottom: "4px solid white",
                borderRight: "4px solid white",
                transform: "rotate(45deg) translateY(-3px)",
              }}
            />
          </Box>
        )}

        {/* Error X mark effect */}
        {isError && (
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 50,
              height: 50,
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(239, 68, 68, 0.4)",
              animation: `${shake} 0.5s ease`,
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: 25,
                height: 25,
                "&::before, &::after": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 3,
                  height: 25,
                  background: "white",
                  borderRadius: 2,
                },
                "&::before": {
                  transform: "translate(-50%, -50%) rotate(45deg)",
                },
                "&::after": {
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Shadow */}
      <Box
        sx={{
          width: 140,
          height: 15,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.3), transparent)",
          borderRadius: "50%",
          mt: 1,
          animation: `${pulse} 4s ease-in-out infinite`,
        }}
      />
    </Box>
  );
};

export default BusinessAvatar;
