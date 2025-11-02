// src/components/common/AnimatedCharacter.js
import React, { useState, useEffect, useRef } from "react";
import { Box, Zoom } from "@mui/material";

/**
 * Reusable 3D Pixar-style Business Assistant Character
 * Features:
 * - Mouse tracking with eyes
 * - Reacts to form field focus (email, password)
 * - Shows emotions (happy, hiding, error, success)
 * - Smooth animations and transitions
 */
const AnimatedCharacter = ({ 
  focusedField = "", 
  hasError = false, 
  isSuccess = false,
  isLoading = false,
  typingInEmail = false,
  typingInPassword = false 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [eyesClosed, setEyesClosed] = useState(false);
  const [bounce, setBounce] = useState(false);
  const characterRef = useRef(null);

  // Track mouse movement for eye following
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (characterRef.current && focusedField !== "password") {
        const rect = characterRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate relative position (-1 to 1)
        const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
        const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);
        
        setMousePosition({
          x: Math.max(-1, Math.min(1, deltaX)) * 8,
          y: Math.max(-1, Math.min(1, deltaY)) * 4
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [focusedField]);

  // Blinking animation
  useEffect(() => {
    if (focusedField !== "password") {
      const blinkInterval = setInterval(() => {
        setEyesClosed(true);
        setTimeout(() => setEyesClosed(false), 150);
      }, 3500);
      return () => clearInterval(blinkInterval);
    }
  }, [focusedField]);

  // Bounce on interaction
  useEffect(() => {
    if (focusedField || isSuccess) {
      setBounce(true);
      setTimeout(() => setBounce(false), 600);
    }
  }, [focusedField, isSuccess]);

  // Determine character state
  const getCharacterState = () => {
    if (isLoading) return "loading";
    if (hasError) return "error";
    if (isSuccess) return "success";
    if (focusedField === "password") return "hiding";
    if (focusedField === "email") return "excited";
    return "idle";
  };

  const state = getCharacterState();

  return (
    <Box
      ref={characterRef}
      sx={{
        position: "relative",
        width: 180,
        height: 240,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "all 0.3s ease",
        animation: bounce 
          ? "characterBounce 0.6s ease" 
          : isLoading 
          ? "pulse 2s ease-in-out infinite" 
          : "characterFloat 4s ease-in-out infinite",
        "@keyframes characterBounce": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "25%": { transform: "translateY(-15px) scale(1.05)" },
          "50%": { transform: "translateY(-5px) scale(0.98)" },
          "75%": { transform: "translateY(-10px) scale(1.02)" },
        },
        "@keyframes characterFloat": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "@keyframes pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
      }}
    >
      {/* Character Body - Pixar Style */}
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Head - Big and round (chibi style) */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: `translateX(-50%) ${state === "error" ? "rotate(-5deg)" : "rotate(0deg)"}`,
            width: 110,
            height: 120,
            background: "linear-gradient(145deg, #ffd6a5 0%, #ffb775 100%)",
            borderRadius: "50% 50% 48% 48%",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
            border: "3px solid rgba(255,255,255,0.3)",
            zIndex: 3,
          }}
        >
          {/* Hair - Professional business style */}
          <Box
            sx={{
              position: "absolute",
              top: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 100,
              height: 50,
              background: "linear-gradient(180deg, #2d3e50 0%, #1a2530 100%)",
              borderRadius: "50% 50% 0 0",
              clipPath: "ellipse(50% 65% at 50% 30%)",
              zIndex: 1,
            }}
          />
          
          {/* Hair Detail - Side */}
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 5,
              width: 30,
              height: 40,
              background: "linear-gradient(145deg, #2d3e50 0%, #1a2530 100%)",
              borderRadius: "0 50% 50% 0",
              transform: "rotate(-10deg)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 5,
              width: 30,
              height: 40,
              background: "linear-gradient(145deg, #2d3e50 0%, #1a2530 100%)",
              borderRadius: "50% 0 0 50%",
              transform: "rotate(10deg)",
            }}
          />

          {/* Face Features Container */}
          <Box sx={{ position: "relative", pt: 3 }}>
            {/* Eyes - Big and expressive */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2.5 }}>
              {/* Left Eye */}
              <Box
                sx={{
                  position: "relative",
                  width: 28,
                  height: focusedField === "password" || eyesClosed ? 4 : 28,
                  background: "white",
                  borderRadius: focusedField === "password" || eyesClosed ? "50%" : "50%",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                }}
              >
                {!eyesClosed && focusedField !== "password" && (
                  <>
                    {/* Iris */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px))`,
                        width: 16,
                        height: 16,
                        background: "radial-gradient(circle at 30% 30%, #6b4423, #3d2817)",
                        borderRadius: "50%",
                        transition: "transform 0.15s ease-out",
                      }}
                    >
                      {/* Pupil */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 8,
                          height: 8,
                          background: "#000",
                          borderRadius: "50%",
                        }}
                      />
                      {/* Shine */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 3,
                          left: 4,
                          width: 5,
                          height: 5,
                          background: "white",
                          borderRadius: "50%",
                          opacity: 0.9,
                        }}
                      />
                    </Box>
                  </>
                )}
              </Box>

              {/* Right Eye */}
              <Box
                sx={{
                  position: "relative",
                  width: 28,
                  height: focusedField === "password" || eyesClosed ? 4 : 28,
                  background: "white",
                  borderRadius: focusedField === "password" || eyesClosed ? "50%" : "50%",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                }}
              >
                {!eyesClosed && focusedField !== "password" && (
                  <>
                    {/* Iris */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px))`,
                        width: 16,
                        height: 16,
                        background: "radial-gradient(circle at 30% 30%, #6b4423, #3d2817)",
                        borderRadius: "50%",
                        transition: "transform 0.15s ease-out",
                      }}
                    >
                      {/* Pupil */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 8,
                          height: 8,
                          background: "#000",
                          borderRadius: "50%",
                        }}
                      />
                      {/* Shine */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 3,
                          left: 4,
                          width: 5,
                          height: 5,
                          background: "white",
                          borderRadius: "50%",
                          opacity: 0.9,
                        }}
                      />
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            {/* Eyebrows - Expressive */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2.5, mt: -1.5 }}>
              <Box
                sx={{
                  width: 22,
                  height: 4,
                  background: "#2d3e50",
                  borderRadius: "50%",
                  transform: hasError 
                    ? "rotate(-15deg) translateY(2px)" 
                    : state === "excited"
                    ? "rotate(-5deg) translateY(-1px)"
                    : "rotate(-8deg)",
                  transition: "all 0.3s ease",
                }}
              />
              <Box
                sx={{
                  width: 22,
                  height: 4,
                  background: "#2d3e50",
                  borderRadius: "50%",
                  transform: hasError 
                    ? "rotate(15deg) translateY(2px)" 
                    : state === "excited"
                    ? "rotate(5deg) translateY(-1px)"
                    : "rotate(8deg)",
                  transition: "all 0.3s ease",
                }}
              />
            </Box>

            {/* Nose - Small and cute */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: 48,
                width: 8,
                height: 10,
                background: "linear-gradient(145deg, #ffb775 0%, #ff9d4a 100%)",
                borderRadius: "50% 50% 50% 50%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />

            {/* Mouth - Changes with emotion */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: 62,
                width: hasError ? 35 : isSuccess ? 45 : 38,
                height: hasError ? 25 : isSuccess ? 20 : 18,
                borderRadius: hasError ? "50% 50% 50% 50%" : "50%",
                background: hasError 
                  ? "transparent"
                  : "linear-gradient(180deg, #ff6b9d 0%, #ff4081 100%)",
                border: hasError ? "3px solid #d32f2f" : "none",
                borderTop: hasError ? "none" : undefined,
                borderBottom: hasError ? "3px solid #d32f2f" : undefined,
                transition: "all 0.3s ease",
                overflow: "hidden",
                animation: isSuccess ? "smile 0.5s ease" : "none",
                "@keyframes smile": {
                  "0%, 100%": { transform: "translateX(-50%) scale(1)" },
                  "50%": { transform: "translateX(-50%) scale(1.1)" },
                },
              }}
            >
              {/* Teeth when smiling */}
              {(isSuccess || state === "excited") && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "70%",
                    height: "40%",
                    background: "white",
                    borderRadius: "50%",
                  }}
                />
              )}
            </Box>

            {/* Blush - When excited */}
            {state === "excited" && (
              <>
                <Box
                  sx={{
                    position: "absolute",
                    left: 12,
                    top: 48,
                    width: 18,
                    height: 12,
                    background: "rgba(255, 107, 157, 0.3)",
                    borderRadius: "50%",
                    animation: "blush 1s ease infinite",
                    "@keyframes blush": {
                      "0%, 100%": { opacity: 0.3 },
                      "50%": { opacity: 0.5 },
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    right: 12,
                    top: 48,
                    width: 18,
                    height: 12,
                    background: "rgba(255, 107, 157, 0.3)",
                    borderRadius: "50%",
                    animation: "blush 1s ease infinite",
                  }}
                />
              </>
            )}
          </Box>
        </Box>

        {/* Hands covering eyes when typing password */}
        {focusedField === "password" && (
          <>
            <Zoom in={true} timeout={300}>
              <Box
                sx={{
                  position: "absolute",
                  top: 48,
                  left: "calc(50% - 70px)",
                  width: 40,
                  height: 40,
                  background: "linear-gradient(145deg, #ffd6a5 0%, #ffb775 100%)",
                  borderRadius: "50%",
                  border: "3px solid #ff9d4a",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  animation: "wiggleLeft 1s ease-in-out infinite",
                  zIndex: 4,
                  "@keyframes wiggleLeft": {
                    "0%, 100%": { transform: "rotate(-8deg) translateX(0)" },
                    "50%": { transform: "rotate(-5deg) translateX(-2px)" },
                  },
                }}
              >
                {/* Fingers */}
                <Box sx={{ position: "absolute", bottom: -5, left: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        position: "absolute",
                        left: i * 7,
                        width: 6,
                        height: 12,
                        background: "#ffb775",
                        borderRadius: "50%",
                        transform: `rotate(${i * 8}deg)`,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Zoom>
            <Zoom in={true} timeout={300}>
              <Box
                sx={{
                  position: "absolute",
                  top: 48,
                  right: "calc(50% - 70px)",
                  width: 40,
                  height: 40,
                  background: "linear-gradient(145deg, #ffd6a5 0%, #ffb775 100%)",
                  borderRadius: "50%",
                  border: "3px solid #ff9d4a",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  animation: "wiggleRight 1s ease-in-out infinite",
                  zIndex: 4,
                  "@keyframes wiggleRight": {
                    "0%, 100%": { transform: "rotate(8deg) translateX(0)" },
                    "50%": { transform: "rotate(5deg) translateX(2px)" },
                  },
                }}
              >
                {/* Fingers */}
                <Box sx={{ position: "absolute", bottom: -5, right: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        position: "absolute",
                        right: i * 7,
                        width: 6,
                        height: 12,
                        background: "#ffb775",
                        borderRadius: "50%",
                        transform: `rotate(-${i * 8}deg)`,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Zoom>
          </>
        )}

        {/* Body - Business Suit */}
        <Box
          sx={{
            position: "absolute",
            top: 115,
            left: "50%",
            transform: "translateX(-50%)",
            width: 90,
            height: 70,
            background: "linear-gradient(180deg, #1e3a5f 0%, #152d4a 100%)",
            borderRadius: "20px 20px 25px 25px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            zIndex: 2,
          }}
        >
          {/* White Shirt */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 35,
              height: 50,
              background: "linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)",
              borderRadius: "5px 5px 0 0",
              clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
            }}
          />

          {/* Tie */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 12,
              height: 45,
              background: "repeating-linear-gradient(45deg, #4a90e2, #4a90e2 4px, #357abd 4px, #357abd 8px)",
              clipPath: "polygon(50% 0%, 100% 0%, 70% 70%, 50% 100%, 30% 70%, 0% 0%)",
              zIndex: 1,
            }}
          />

          {/* Suit Lapels */}
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 20,
              height: 35,
              background: "linear-gradient(135deg, #1e3a5f 0%, #0f1f33 100%)",
              borderRadius: "5px 0 15px 0",
              transform: "rotate(-5deg)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 20,
              height: 35,
              background: "linear-gradient(225deg, #1e3a5f 0%, #0f1f33 100%)",
              borderRadius: "0 5px 0 15px",
              transform: "rotate(5deg)",
            }}
          />

          {/* Belt */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              height: 8,
              background: "#2d2d2d",
              borderRadius: "0 0 25px 25px",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 12,
                height: 10,
                background: "linear-gradient(145deg, #c0c0c0 0%, #808080 100%)",
                borderRadius: "2px",
                border: "1px solid #606060",
              }}
            />
          </Box>
        </Box>

        {/* Arms - Hands on hips */}
        <Box
          sx={{
            position: "absolute",
            top: 130,
            left: "calc(50% - 60px)",
            width: 25,
            height: 50,
            background: "linear-gradient(180deg, #1e3a5f 0%, #152d4a 50%, #ffd6a5 50%, #ffb775 100%)",
            borderRadius: "12px",
            transform: "rotate(-20deg)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 130,
            right: "calc(50% - 60px)",
            width: 25,
            height: 50,
            background: "linear-gradient(180deg, #1e3a5f 0%, #152d4a 50%, #ffd6a5 50%, #ffb775 100%)",
            borderRadius: "12px",
            transform: "rotate(20deg)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
        />

        {/* Legs - Short chibi style */}
        <Box
          sx={{
            position: "absolute",
            top: 180,
            left: "calc(50% - 32px)",
            width: 20,
            height: 45,
            background: "linear-gradient(180deg, #1a2b3d 0%, #0f1821 70%, #2d2d2d 70%, #1a1a1a 100%)",
            borderRadius: "8px 8px 12px 12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 180,
            right: "calc(50% - 32px)",
            width: 20,
            height: 45,
            background: "linear-gradient(180deg, #1a2b3d 0%, #0f1821 70%, #2d2d2d 70%, #1a1a1a 100%)",
            borderRadius: "8px 8px 12px 12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />
      </Box>

      {/* Loading Spinner */}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: -20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 200,
            border: "4px solid rgba(102, 126, 234, 0.1)",
            borderTop: "4px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            "@keyframes spin": {
              "0%": { transform: "translateX(-50%) rotate(0deg)" },
              "100%": { transform: "translateX(-50%) rotate(360deg)" },
            },
          }}
        />
      )}

      {/* Success Stars */}
      {isSuccess && (
        <>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                top: 20 + i * 30,
                left: i % 2 === 0 ? 10 : 160,
                fontSize: 24,
                animation: `starPop 0.6s ease ${i * 0.1}s`,
                "@keyframes starPop": {
                  "0%": { transform: "scale(0) rotate(0deg)", opacity: 0 },
                  "50%": { transform: "scale(1.3) rotate(180deg)", opacity: 1 },
                  "100%": { transform: "scale(1) rotate(360deg)", opacity: 0.8 },
                },
              }}
            >
              ⭐
            </Box>
          ))}
        </>
      )}

      {/* Error Sweat Drops */}
      {hasError && (
        <>
          {[0, 1].map((i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                top: 30,
                left: i === 0 ? 40 : 130,
                fontSize: 20,
                animation: "sweatDrop 1s ease infinite",
                animationDelay: `${i * 0.3}s`,
                "@keyframes sweatDrop": {
                  "0%": { transform: "translateY(0) scale(1)", opacity: 0 },
                  "50%": { opacity: 1 },
                  "100%": { transform: "translateY(30px) scale(0.5)", opacity: 0 },
                },
              }}
            >
              💧
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default AnimatedCharacter;
