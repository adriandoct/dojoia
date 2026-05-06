async function fetchLessons() {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        progress:student_progress(*),
        module:modules(*),
        level:levels(*)
      `)
      .eq('module.code', 'math')
      .order('order_index')
      .limit(10)

    if (error) throw error

    if (data) {
      const formattedLessons = (data as any[]).map((lesson) => ({
        ...(lesson as object),
        progress: Array.isArray(lesson.progress)
          ? lesson.progress[0]
          : lesson.progress ?? undefined,
      }))

      setLessons(formattedLessons)

      const firstAvailable = formattedLessons.find(
        (l) => !l.is_locked
      )

      if (firstAvailable) {
        setActiveLesson(firstAvailable)
      }
    }
  } catch (error) {
    console.error('Error fetching lessons:', error)
  } finally {
    setLoading(false)
  }
}